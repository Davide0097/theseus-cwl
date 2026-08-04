import fs from "fs/promises";
import path from "path";

import { afterEach, describe, expect, it } from "vitest";

import type { CwlSource } from "@theseus-cwl/types";

import {
  parseCwlMessages,
  safeJoin,
  stripTempDir,
  windowsPathToWsl,
  writeCwlSourceToTempDir,
} from "../src/validate";

// ===========================================================================
// stripTempDir — remove the server-side temp path from cwltool output
// ===========================================================================

describe("stripTempDir", () => {
  it("strips a bare temp-dir prefix from a position line", () => {
    expect(
      stripTempDir("/tmp/cwl-a1b2/main.cwl:12:5: boom", "/tmp/cwl-a1b2"),
    ).toBe("main.cwl:12:5: boom");
  });

  it("strips the file:// URI form", () => {
    expect(
      stripTempDir(
        "INFO Resolved 'file:///tmp/cwl-a1b2/main.cwl'",
        "/tmp/cwl-a1b2",
      ),
    ).toBe("INFO Resolved 'main.cwl'");
  });

  it("tolerates a trailing slash on the dir", () => {
    expect(stripTempDir("/tmp/cwl-a1b2/x.cwl", "/tmp/cwl-a1b2/")).toBe("x.cwl");
  });

  it("leaves unrelated absolute paths untouched", () => {
    expect(stripTempDir("/usr/local/bin/cwltool 3.1.0", "/tmp/cwl-a1b2")).toBe(
      "/usr/local/bin/cwltool 3.1.0",
    );
  });
});

// ===========================================================================
// parseCwlMessages — structured diagnostics
// ===========================================================================

describe("parseCwlMessages", () => {
  it("parses a position line into structured fields and defaults to error", () => {
    expect(parseCwlMessages("main.cwl:12:5: Object is not valid")).toEqual([
      {
        severity: "error",
        file: "main.cwl",
        line: 12,
        column: 5,
        text: "Object is not valid",
      },
    ]);
  });

  it("reads severity from a leading log level and strips the prefix", () => {
    expect(
      parseCwlMessages("ERROR Tool definition failed validation:"),
    ).toEqual([
      { severity: "error", text: "Tool definition failed validation:" },
    ]);
  });

  it("combines a level prefix with a position", () => {
    expect(parseCwlMessages("ERROR steps/tool.cwl:7:3: bad type")).toEqual([
      {
        severity: "error",
        file: "steps/tool.cwl",
        line: 7,
        column: 3,
        text: "bad type",
      },
    ]);
  });

  it("infers warning severity from a position line mentioning a warning", () => {
    const [msg] = parseCwlMessages(
      "main.cwl:1:1: Warning: field is deprecated",
    );
    expect(msg.severity).toBe("warning");
    expect(msg.file).toBe("main.cwl");
  });

  it("drops cwltool banner and resolution noise", () => {
    const messages = parseCwlMessages(
      [
        "INFO /usr/local/bin/cwltool 3.1.0",
        "INFO Resolved 'main.cwl' to 'file://main.cwl'",
        "INFO main.cwl is valid CWL",
      ].join("\n"),
    );
    expect(messages).toEqual([]);
  });

  it("drops the success line even without an INFO prefix", () => {
    // cwltool prints the valid-CWL message to stdout with no log level.
    expect(parseCwlMessages("document.cwl is valid CWL.")).toEqual([]);
  });

  it("merges indented continuation lines into the preceding diagnostic", () => {
    // Real cwltool --verbose output (already temp-path-cleaned), wrapped narrow.
    const output = [
      "ERROR Tool definition failed validation:",
      "document.cwl:6:5: while constructing",
      "                          a mapping",
      "document.cwl:8:5:   found duplicate",
      '                            key "id" with value',
      '                            "output" (original',
      '                            value: "in")',
    ].join("\n");

    expect(parseCwlMessages(output)).toEqual([
      { severity: "error", text: "Tool definition failed validation:" },
      {
        severity: "error",
        file: "document.cwl",
        line: 6,
        column: 5,
        text: "while constructing a mapping",
      },
      {
        severity: "error",
        file: "document.cwl",
        line: 8,
        column: 5,
        text: 'found duplicate key "id" with value "output" (original value: "in")',
      },
    ]);
  });

  it("strips a leftover file:// scheme from the position file", () => {
    const [msg] = parseCwlMessages("file://document.cwl:3:1: bad thing");
    expect(msg.file).toBe("document.cwl");
    expect(msg.severity).toBe("error");
  });

  it("keeps a non-noise info line", () => {
    expect(parseCwlMessages("INFO packing workflow")).toEqual([
      { severity: "info", text: "packing workflow" },
    ]);
  });

  it("ignores blank lines", () => {
    expect(parseCwlMessages("\n\n")).toEqual([]);
  });
});

// ===========================================================================
// windowsPathToWsl
// ===========================================================================

describe("windowsPathToWsl", () => {
  it("converts a drive-letter path to a /mnt path with forward slashes", () => {
    expect(windowsPathToWsl("C:\\Users\\me\\cwl-abc\\main.cwl")).toBe(
      "/mnt/c/Users/me/cwl-abc/main.cwl",
    );
  });

  it("lowercases the drive letter", () => {
    expect(windowsPathToWsl("D:\\tmp")).toBe("/mnt/d/tmp");
  });

  it("leaves an already-posix path unchanged", () => {
    expect(windowsPathToWsl("/tmp/cwl-abc/main.cwl")).toBe(
      "/tmp/cwl-abc/main.cwl",
    );
  });
});

// ===========================================================================
// safeJoin — path-traversal guard
// ===========================================================================

describe("safeJoin", () => {
  const dir = path.resolve("/tmp/cwl-test");

  it("joins a plain relative name inside the dir", () => {
    expect(safeJoin(dir, "main.cwl")).toBe(path.join(dir, "main.cwl"));
  });

  it("allows a nested relative name", () => {
    expect(safeJoin(dir, "steps/tool.cwl")).toBe(
      path.join(dir, "steps/tool.cwl"),
    );
  });

  it("rejects parent-directory traversal", () => {
    expect(() => safeJoin(dir, "../escape.cwl")).toThrow(/Unsafe path/);
  });

  it("rejects deep traversal that resolves outside the dir", () => {
    expect(() => safeJoin(dir, "a/../../escape.cwl")).toThrow(/Unsafe path/);
  });

  it("rejects an absolute path", () => {
    expect(() => safeJoin(dir, path.resolve("/etc/passwd"))).toThrow(
      /Unsafe path/,
    );
  });

  it("attaches a 400 status to the thrown error", () => {
    try {
      safeJoin(dir, "../nope");
      throw new Error("expected safeJoin to throw");
    } catch (err) {
      expect((err as { status?: number }).status).toBe(400);
    }
  });
});

// ===========================================================================
// writeCwlSourceToTempDir — real filesystem materialization
// ===========================================================================

describe("writeCwlSourceToTempDir", () => {
  const created: string[] = [];

  afterEach(async () => {
    while (created.length) {
      const dir = created.pop()!;
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it("writes string documents verbatim and returns the entrypoint path", async () => {
    const source = {
      entrypoint: "main.cwl",
      documents: [{ name: "main.cwl", content: "class: Workflow\n" }],
      parameters: [],
    } as unknown as CwlSource;

    const { dir, entrypointPath } = await writeCwlSourceToTempDir(source);
    created.push(dir);

    expect(entrypointPath).toBe(path.join(dir, "main.cwl"));
    expect(await fs.readFile(entrypointPath, "utf8")).toBe("class: Workflow\n");
  });

  it("YAML-serializes object document content", async () => {
    const source = {
      entrypoint: "main.cwl",
      documents: [{ name: "main.cwl", content: { class: "Workflow" } }],
      parameters: [],
    } as unknown as CwlSource;

    const { dir, entrypointPath } = await writeCwlSourceToTempDir(source);
    created.push(dir);

    expect(await fs.readFile(entrypointPath, "utf8")).toContain(
      "class: Workflow",
    );
  });

  it("writes a .json string parameter verbatim and JSON-stringifies objects", async () => {
    const source = {
      entrypoint: "main.cwl",
      documents: [{ name: "main.cwl", content: "class: Workflow\n" }],
      parameters: [
        { name: "job.json", content: '{"n":1}' },
        { name: "other.yml", content: { n: 2 } },
      ],
    } as unknown as CwlSource;

    const { dir } = await writeCwlSourceToTempDir(source);
    created.push(dir);

    expect(await fs.readFile(path.join(dir, "job.json"), "utf8")).toBe(
      '{"n":1}',
    );
    expect(await fs.readFile(path.join(dir, "other.yml"), "utf8")).toBe(
      '{"n":2}',
    );
  });

  it("creates nested directories for nested document names", async () => {
    const source = {
      entrypoint: "main.cwl",
      documents: [
        { name: "main.cwl", content: "class: Workflow\n" },
        { name: "steps/tool.cwl", content: "class: CommandLineTool\n" },
      ],
      parameters: [],
    } as unknown as CwlSource;

    const { dir } = await writeCwlSourceToTempDir(source);
    created.push(dir);

    expect(await fs.readFile(path.join(dir, "steps/tool.cwl"), "utf8")).toBe(
      "class: CommandLineTool\n",
    );
  });

  it("rejects a traversing document name without leaving a temp dir behind", async () => {
    const source = {
      entrypoint: "main.cwl",
      documents: [{ name: "../escape.cwl", content: "x" }],
      parameters: [],
    } as unknown as CwlSource;

    await expect(writeCwlSourceToTempDir(source)).rejects.toThrow(
      /Unsafe path/,
    );
  });
});
