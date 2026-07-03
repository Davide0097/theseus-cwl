import { describe, expect, it } from "vitest";

import type { Process, Shape, Workflow } from "@theseus-cwl/types";

import {
  assertAndGetDocumentContent,
  assertAndGetDocumentFormat,
  assertAndGetDocumentName,
  assertAndGetParameterContent,
  assertAndGetParameterFormat,
  assertAndGetParameterName,
  assertAndGetProcessClass,
  assertAndGetStepRun,
  buildFallbackId,
} from "../src/utils";

// ===========================================================================
// assertAndGetDocumentName
//
// A document name must be a non-empty (non-whitespace) string; it is returned
// verbatim (no trimming).
// ===========================================================================

describe("assertAndGetDocumentName", () => {
  it("returns a non-empty name unchanged", () => {
    expect(assertAndGetDocumentName("workflow.cwl")).toBe("workflow.cwl");
  });

  it("does not trim — surrounding whitespace is preserved on a valid name", () => {
    expect(assertAndGetDocumentName("  a.cwl  ")).toBe("  a.cwl  ");
  });

  it("throws on an empty string", () => {
    expect(() => assertAndGetDocumentName("")).toThrow(
      /Document `name` must be a non-empty string/,
    );
  });

  it("throws on a whitespace-only string", () => {
    expect(() => assertAndGetDocumentName("   ")).toThrow(
      /Document `name` must be a non-empty string/,
    );
  });

  it("throws on non-string values (null, undefined, number, object)", () => {
    for (const bad of [null, undefined, 42, { toString: () => "x.cwl" }]) {
      expect(() => assertAndGetDocumentName(bad as never)).toThrow(
        /Document `name` must be a non-empty string/,
      );
    }
  });
});

// ===========================================================================
// assertAndGetDocumentFormat
//
// Maps a document's filename extension (case-insensitive, last dot wins) to a
// parser format. Documents allow .json/.cwl/.yaml/.yml only (NOT .txt).
// ===========================================================================

describe("assertAndGetDocumentFormat", () => {
  it("maps .json to json", () => {
    expect(assertAndGetDocumentFormat("tool.json")).toBe("json");
  });

  it("maps .cwl / .yaml / .yml to yaml", () => {
    expect(assertAndGetDocumentFormat("wf.cwl")).toBe("yaml");
    expect(assertAndGetDocumentFormat("wf.yaml")).toBe("yaml");
    expect(assertAndGetDocumentFormat("wf.yml")).toBe("yaml");
  });

  it("detects the extension case-insensitively", () => {
    expect(assertAndGetDocumentFormat("Tool.JSON")).toBe("json");
    expect(assertAndGetDocumentFormat("WF.CWL")).toBe("yaml");
    expect(assertAndGetDocumentFormat("WF.Yaml")).toBe("yaml");
  });

  it("uses only the last dot when a name has several", () => {
    expect(assertAndGetDocumentFormat("my.workflow.cwl")).toBe("yaml");
  });

  it("treats a leading-dot name as its own extension", () => {
    // lastIndexOf('.') === 0, so ".cwl" itself is read as the extension.
    expect(assertAndGetDocumentFormat(".cwl")).toBe("yaml");
  });

  it("rejects .txt for documents (allowed only for parameters)", () => {
    expect(() => assertAndGetDocumentFormat("notes.txt")).toThrow(
      /unsupported format/,
    );
  });

  it("rejects an unknown extension", () => {
    expect(() => assertAndGetDocumentFormat("image.svg")).toThrow(
      /Document named image\.svg has an unsupported format/,
    );
  });

  it("rejects a name with no extension", () => {
    expect(() => assertAndGetDocumentFormat("noext")).toThrow(
      /unsupported format/,
    );
  });

  it("rejects a name ending in a bare dot", () => {
    expect(() => assertAndGetDocumentFormat("file.")).toThrow(
      /unsupported format/,
    );
  });
});

// ===========================================================================
// assertAndGetDocumentContent
//
// Presence-only guard: rejects falsy content (undefined / "" / null), returns
// anything truthy unchanged. The string-vs-File-vs-object type check lives in
// the holder's pipeline, not here.
// ===========================================================================

describe("assertAndGetDocumentContent", () => {
  it("returns a truthy string unchanged", () => {
    expect(assertAndGetDocumentContent("class: Workflow")).toBe(
      "class: Workflow",
    );
  });

  it("returns an object unchanged", () => {
    const obj = { class: "Workflow" as const };
    expect(assertAndGetDocumentContent(obj as never)).toBe(obj);
  });

  it("throws on undefined content", () => {
    expect(() => assertAndGetDocumentContent(undefined as never)).toThrow(
      /Document is missing the content/,
    );
  });

  it("throws on an empty string (treated as missing)", () => {
    expect(() => assertAndGetDocumentContent("")).toThrow(
      /Document is missing the content/,
    );
  });

  it("throws on null content", () => {
    expect(() => assertAndGetDocumentContent(null as never)).toThrow(
      /Document is missing the content/,
    );
  });
});

// ===========================================================================
// assertAndGetParameterName
// ===========================================================================

describe("assertAndGetParameterName", () => {
  it("returns a non-empty name unchanged", () => {
    expect(assertAndGetParameterName("inputs.json")).toBe("inputs.json");
  });

  it("throws on empty / whitespace / non-string names", () => {
    for (const bad of ["", "   ", null, undefined, 42]) {
      expect(() => assertAndGetParameterName(bad as never)).toThrow(
        /Parameter `name` must be a non-empty string/,
      );
    }
  });
});

// ===========================================================================
// assertAndGetParameterFormat
//
// Like the document format, but parameters additionally allow .txt.
// ===========================================================================

describe("assertAndGetParameterFormat", () => {
  it("maps .json to json and .cwl/.yaml/.yml to yaml", () => {
    expect(assertAndGetParameterFormat("p.json")).toBe("json");
    expect(assertAndGetParameterFormat("p.cwl")).toBe("yaml");
    expect(assertAndGetParameterFormat("p.yaml")).toBe("yaml");
    expect(assertAndGetParameterFormat("p.yml")).toBe("yaml");
  });

  it("additionally allows .txt (mapped to txt)", () => {
    expect(assertAndGetParameterFormat("notes.txt")).toBe("txt");
  });

  it("detects .txt case-insensitively", () => {
    expect(assertAndGetParameterFormat("NOTES.TXT")).toBe("txt");
  });

  it("rejects an unknown extension", () => {
    expect(() => assertAndGetParameterFormat("image.svg")).toThrow(
      /Parameter item named image\.svg has an unsupported format/,
    );
  });

  it("rejects a name with no extension", () => {
    expect(() => assertAndGetParameterFormat("noext")).toThrow(
      /unsupported format/,
    );
  });
});

// ===========================================================================
// assertAndGetParameterContent
//
// Presence-only guard (rejects falsy). It does NOT enforce string-or-File —
// that rejection is deferred to the holder's sanitizeParameters_ step.
// ===========================================================================

describe("assertAndGetParameterContent", () => {
  it("returns truthy string content unchanged", () => {
    expect(assertAndGetParameterContent("{}")).toBe("{}");
  });

  it("returns a File unchanged", () => {
    const file = new File(["{}"], "inputs.json");
    expect(assertAndGetParameterContent(file)).toBe(file);
  });

  it("only checks presence — a truthy non-string/File value is returned, not rejected", () => {
    // Type rejection happens later in the pipeline; this guard only guarantees
    // the value is present.
    expect(assertAndGetParameterContent(42 as never)).toBe(42);
  });

  it("throws on undefined content", () => {
    expect(() => assertAndGetParameterContent(undefined)).toThrow(
      /Parameter item is missing the content/,
    );
  });

  it("throws on an empty string (treated as missing)", () => {
    expect(() => assertAndGetParameterContent("")).toThrow(
      /Parameter item is missing the content/,
    );
  });
});

// ===========================================================================
// assertAndGetProcessClass
//
// The `class` must be present and one of the four known CWL process classes.
// ===========================================================================

describe("assertAndGetProcessClass", () => {
  it("returns each known process class unchanged", () => {
    for (const cls of [
      "Workflow",
      "CommandLineTool",
      "ExpressionTool",
      "Operation",
    ]) {
      expect(assertAndGetProcessClass(cls)).toBe(cls);
    }
  });

  it("throws 'missing' on empty / whitespace class", () => {
    expect(() => assertAndGetProcessClass("")).toThrow(
      /missing the required `class`/,
    );
    expect(() => assertAndGetProcessClass("   ")).toThrow(
      /missing the required `class`/,
    );
  });

  it("throws 'missing' on non-string class (undefined, null, number)", () => {
    for (const bad of [undefined, null, 42]) {
      expect(() => assertAndGetProcessClass(bad as never)).toThrow(
        /missing the required `class`/,
      );
    }
  });

  it("throws 'unknown' on a non-CWL class name", () => {
    expect(() => assertAndGetProcessClass("Banana")).toThrow(
      /unknown 'class' field "Banana"/,
    );
  });

  it("is case-sensitive — 'workflow' is an unknown class", () => {
    expect(() => assertAndGetProcessClass("workflow")).toThrow(
      /unknown 'class' field "workflow"/,
    );
  });
});

// ===========================================================================
// assertAndGetStepRun
//
// A step `run` must be present and either a string reference or an inline
// process object; a missing run and a non-string/non-object run are distinct
// errors.
// ===========================================================================

describe("assertAndGetStepRun", () => {
  it("returns a string reference unchanged", () => {
    expect(assertAndGetStepRun("tool.cwl")).toBe("tool.cwl");
  });

  it("returns an inline process object unchanged", () => {
    const run = { class: "CommandLineTool" as const, inputs: {}, outputs: {} };
    expect(assertAndGetStepRun(run as never)).toBe(run);
  });

  it("throws 'missing' on undefined / null / empty-string run", () => {
    expect(() => assertAndGetStepRun(undefined)).toThrow(
      /missing the required `run`/,
    );
    expect(() => assertAndGetStepRun(null as never)).toThrow(
      /missing the required `run`/,
    );
    expect(() => assertAndGetStepRun("" as never)).toThrow(
      /missing the required `run`/,
    );
  });

  it("throws 'invalid' on an array run", () => {
    expect(() => assertAndGetStepRun([] as never)).toThrow(/invalid `run`/);
  });

  it("throws 'invalid' on a non-string, non-object run (number, boolean)", () => {
    expect(() => assertAndGetStepRun(42 as never)).toThrow(/invalid `run`/);
    expect(() => assertAndGetStepRun(true as never)).toThrow(/invalid `run`/);
  });
});

// ===========================================================================
// buildFallbackId
//
// Deterministic id derived from a signature of (class, label, sorted input key
// names, sorted output key names). Format: `<class-lowercase>_<base36-hash>`.
// ===========================================================================

describe("buildFallbackId", () => {
  const process = (over: Partial<Process<Shape.Raw>>): Process<Shape.Raw> =>
    ({
      class: "CommandLineTool",
      inputs: {},
      outputs: {},
      ...over,
    }) as Process<Shape.Raw>;

  it("prefixes the id with the lowercased class name", () => {
    expect(buildFallbackId(process({ class: "CommandLineTool" }))).toMatch(
      /^commandlinetool_[0-9a-z]+$/,
    );
    expect(
      buildFallbackId(process({ class: "ExpressionTool" } as never)),
    ).toMatch(/^expressiontool_[0-9a-z]+$/);
    expect(buildFallbackId(process({ class: "Operation" } as never))).toMatch(
      /^operation_[0-9a-z]+$/,
    );
    expect(
      buildFallbackId({
        class: "Workflow",
        outputs: {},
        steps: {},
      } as Workflow<Shape.Raw>),
    ).toMatch(/^workflow_[0-9a-z]+$/);
  });

  it("is deterministic for the same signature", () => {
    const a = process({ inputs: { a: "string" }, outputs: { o: "File" } });
    const b = process({ inputs: { a: "string" }, outputs: { o: "File" } });
    expect(buildFallbackId(a)).toBe(buildFallbackId(b));
  });

  it("ignores input/output key ordering (keys are sorted before hashing)", () => {
    const ordered = process({ inputs: { a: "string", b: "int" } });
    const reversed = process({ inputs: { b: "int", a: "string" } });
    expect(buildFallbackId(ordered)).toBe(buildFallbackId(reversed));
  });

  it("differs when the input signature differs", () => {
    expect(buildFallbackId(process({ inputs: { a: "string" } }))).not.toBe(
      buildFallbackId(process({ inputs: { b: "string" } })),
    );
  });

  it("differs when the output signature differs", () => {
    expect(buildFallbackId(process({ outputs: { a: "File" } }))).not.toBe(
      buildFallbackId(process({ outputs: { b: "File" } })),
    );
  });

  it("differs when the label differs", () => {
    expect(buildFallbackId(process({}))).not.toBe(
      buildFallbackId(process({ label: "labelled" } as never)),
    );
  });

  it("collides for two processes that differ only outside the signature (documented caveat)", () => {
    // The signature ignores everything but class/label/input+output keys, so
    // two processes with the same shape but different bodies hash identically.
    const a = process({
      inputs: { a: "string" },
      baseCommand: "echo",
    } as never);
    const b = process({ inputs: { a: "string" }, baseCommand: "cat" } as never);
    expect(buildFallbackId(a)).toBe(buildFallbackId(b));
  });
});
