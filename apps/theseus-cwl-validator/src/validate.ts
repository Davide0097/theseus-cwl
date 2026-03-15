import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import YAML from "yaml";

import { CwlSource } from "@theseus-cwl/types";

function windowsPathToWsl(path: string) {
  return path
    .replace(/\\/g, "/")
    .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
}

function parseCwlOutput(output: string) {
  const lines = output.split("\n").filter(Boolean);

  const errors: Array<string> = [];
  const warnings: Array<string> = [];

  for (const line of lines) {
    if (line.includes("ERROR")) {
      errors.push(line);
    } else if (line.includes("WARNING")) {
      warnings.push(line);
    }
  }

  return { lines, warnings };
}

function shouldUseWsl() {
  return process.platform === "win32";
}

export async function writeCwlSourceToTempDir(source: CwlSource) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "cwl-"));

  for (const file of source.documents) {
    const fileContent =
      typeof file.content === "string"
        ? file.content
        : YAML.stringify(file.content);

    const filePath = path.join(dir, file.name);

    await fs.writeFile(filePath, fileContent, "utf8");
  }

  for (const input of source.parameters) {
    const fileContent =
      typeof input.content === "string" && input.name.endsWith(".json")
        ? input.content
        : JSON.stringify(input.content);

    const filePath = path.join(dir, input.name);

    await fs.writeFile(filePath, fileContent, "utf8");
  }

  return {
    dir,
    entrypointPath: path.join(dir, source.entrypoint),
  };
}

export async function validateCwl(source: CwlSource) {
  const { dir, entrypointPath } = await writeCwlSourceToTempDir(source);

  return new Promise((resolve, reject) => {
    let proc;

    if (shouldUseWsl()) {
      const wslEntrypoint = windowsPathToWsl(entrypointPath);
      proc = spawn("wsl", [
        "-d",
        "Ubuntu",
        "cwltool",
        "--validate",
        "--no-container",
        "--disable-color",
        "--verbose",
        "--disable-user-provenance",
        wslEntrypoint,
      ]);
    } else {
      proc = spawn("cwltool", [
        "--validate",
        "--no-container",
        "--disable-color",
        "--verbose",
        "--disable-user-provenance",
        entrypointPath,
      ]);
    }

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("close", async () => {
      await fs.rm(dir, { recursive: true, force: true });

      const combined = stdout + "\n" + stderr;
      const { lines, warnings } = parseCwlOutput(combined);

      resolve({
        valid: lines.some((line) => line.includes("is valid CWL")),
        lines,
        warnings,
      });
    });

    proc.on("error", reject);
  });
}
