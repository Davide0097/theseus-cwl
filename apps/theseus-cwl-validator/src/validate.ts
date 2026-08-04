import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import YAML from "yaml";

import type { CwlSource } from "@theseus-cwl/types";

const DEFAULT_TIMEOUT_MS = 30_000;

export type CwlMessageSeverity = "error" | "warning" | "info";

/**
 * A single normalized diagnostic parsed from cwltool output. The validator owns
 * this normalization so consumers never have to parse cwltool's raw, verbose
 * output or see server-side temp paths.
 */
export type CwlMessage = {
  severity: CwlMessageSeverity;
  /** Source file the diagnostic points at, relative to the workflow root. */
  file?: string;
  line?: number;
  column?: number;
  /** Human-readable message with the log-level prefix and position removed. */
  text: string;
};

export type ValidateCwlResult = {
  valid: boolean;
  /** Structured, path-cleaned diagnostics — the primary output for clients. */
  messages: CwlMessage[];
  /** Path-cleaned raw output lines, kept for back-compat / full-fidelity logs. */
  lines: string[];
};

function httpError(message: string, status: number) {
  const err = new Error(message) as Error & { status?: number };
  err.status = status;
  return err;
}

export function windowsPathToWsl(p: string) {
  return p
    .replace(/\\/g, "/")
    .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
}

/**
 * Join `name` onto `dir` and assert the result stays inside `dir`.
 * Rejects absolute paths and `..` traversal so a malicious document/parameter
 * name cannot write outside the temp directory.
 */
export function safeJoin(dir: string, name: string) {
  const base = path.resolve(dir);
  const target = path.resolve(base, name);

  if (target !== base && !target.startsWith(base + path.sep)) {
    throw httpError(`Unsafe path in name: ${name}`, 400);
  }

  return target;
}

/**
 * Remove the (server-side) temp-dir prefix from cwltool output so paths read as
 * `main.cwl:12:5` instead of `/tmp/cwl-a1b2c3/main.cwl:12:5`. Handles both the
 * bare path and the `file://` URI form. `visibleDir` is the directory *as
 * cwltool sees it* (the WSL-mapped path on Windows, the real path on Linux).
 */
export function stripTempDir(output: string, visibleDir: string) {
  const normalized = visibleDir.replace(/\\/g, "/");
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;

  // Literal split/join avoids having to regex-escape the path.
  return output.split(`file://${withSlash}`).join("").split(withSlash).join("");
}

const LEVEL_RE = /^(ERROR|WARNING|INFO)\b\s*(.*)$/;
const POSITION_RE = /^(\S+):(\d+):(\d+):\s*(.*)$/;

/** cwltool banner / resolution lines that carry no diagnostic value. */
function isBannerNoise(text: string) {
  return (
    /^Resolved\b/.test(text) ||
    /\bis valid CWL\b/.test(text) ||
    /cwltool\s+\d/.test(text)
  );
}

/**
 * Parse cwltool output (already temp-path-cleaned) into structured messages.
 *
 * cwltool hard-wraps long diagnostics across several physical lines, aligning
 * the continuation lines under the `file:line:col:` prefix (they start with
 * whitespace). Those continuations are merged back into the preceding message
 * instead of being emitted as separate (mis-severitied) lines.
 *
 * Severity comes from a leading log level when present, otherwise inferred from
 * a `file:line:column` position line. Best-effort: cwltool's format is
 * version-dependent, so unlabelled top-level lines fall back to `info`.
 */
export function parseCwlMessages(output: string): CwlMessage[] {
  const messages: CwlMessage[] = [];

  for (const raw of output.split("\n")) {
    if (!raw.trim()) continue;

    // Indented line → continuation of the previous diagnostic (a wrapped line).
    if (/^\s/.test(raw) && messages.length > 0) {
      const prev = messages[messages.length - 1];
      prev.text = `${prev.text} ${raw.trim()}`.trim();
      continue;
    }

    let severity: CwlMessageSeverity | undefined;
    let text = raw.trim();

    const levelMatch = text.match(LEVEL_RE);
    if (levelMatch) {
      severity = levelMatch[1].toLowerCase() as CwlMessageSeverity;
      text = levelMatch[2];
    }

    // Drop cwltool banner / resolution / "is valid CWL" lines — the `valid`
    // flag already conveys success. Checked regardless of level, because the
    // success line is printed with no `INFO` prefix.
    if (isBannerNoise(text)) continue;

    let file: string | undefined;
    let line: number | undefined;
    let column: number | undefined;

    const posMatch = text.match(POSITION_RE);
    if (posMatch) {
      file = posMatch[1].replace(/^file:\/\//, "");
      line = Number(posMatch[2]);
      column = Number(posMatch[3]);
      text = posMatch[4];
      if (!severity) {
        severity = /\bwarning\b/i.test(text) ? "warning" : "error";
      }
    }

    if (!severity) severity = "info";

    messages.push({ severity, file, line, column, text });
  }

  return messages;
}

function shouldUseWsl() {
  return process.platform === "win32";
}

export async function writeCwlSourceToTempDir(source: CwlSource) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cwl-"));

  try {
    for (const file of source.documents) {
      const fileContent =
        typeof file.content === "string"
          ? file.content
          : YAML.stringify(file.content);

      const filePath = safeJoin(dir, file.name);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, fileContent, "utf8");
    }

    for (const input of source.parameters) {
      const fileContent =
        typeof input.content === "string" && input.name.endsWith(".json")
          ? input.content
          : JSON.stringify(input.content);

      const filePath = safeJoin(dir, input.name);

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, fileContent, "utf8");
    }

    return {
      dir,
      entrypointPath: safeJoin(dir, source.entrypoint),
    };
  } catch (err) {
    // Don't leak the temp dir if materialization fails partway through.
    await fs.rm(dir, { recursive: true, force: true });
    throw err;
  }
}

export async function validateCwl(
  source: CwlSource,
): Promise<ValidateCwlResult> {
  const { dir, entrypointPath } = await writeCwlSourceToTempDir(source);

  const timeoutMs =
    Number(process.env.VALIDATE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  // The path cwltool actually sees (WSL-mapped on Windows, real path on Linux).
  const visibleDir = shouldUseWsl() ? windowsPathToWsl(dir) : dir;

  return new Promise<ValidateCwlResult>((resolve, reject) => {
    const cwltoolArgs = [
      "--validate",
      "--no-container",
      "--disable-color",
      "--verbose",
      "--disable-user-provenance",
    ];

    let proc;

    if (shouldUseWsl()) {
      const distro = process.env.WSL_DISTRO || "Ubuntu";
      const wslEntrypoint = windowsPathToWsl(entrypointPath);
      proc = spawn("wsl", [
        "-d",
        distro,
        "cwltool",
        ...cwltoolArgs,
        wslEntrypoint,
      ]);
    } else {
      proc = spawn("cwltool", [...cwltoolArgs, entrypointPath]);
    }

    let stdout = "";
    let stderr = "";
    let settled = false;

    const cleanup = () => fs.rm(dir, { recursive: true, force: true });

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      proc.kill("SIGKILL");
      cleanup().finally(() =>
        reject(
          httpError(`cwltool validation timed out after ${timeoutMs}ms`, 504),
        ),
      );
    }, timeoutMs);

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup().finally(() => {
        const cleaned = stripTempDir(`${stdout}\n${stderr}`, visibleDir);
        const lines = cleaned
          .split("\n")
          .map((l) => l.trimEnd())
          .filter(Boolean);

        resolve({
          valid: code === 0,
          messages: parseCwlMessages(cleaned),
          lines,
        });
      });
    });

    proc.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup().finally(() => reject(err));
    });
  });
}
