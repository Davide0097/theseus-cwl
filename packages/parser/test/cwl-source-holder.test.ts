import { describe, expect, it } from "vitest";

import type {
  CWLPackedDocument,
  CwlSource,
  CwlSourceDocument,
  CwlSourceParameter,
  Process,
  Shape,
  Workflow,
} from "@theseus-cwl/types";

import { isPackedDocument, isWorkflow } from "../src/guards";
import { CWLSourceHolder } from "../src/index";
import {
  normalizeInput,
  normalizeOutput,
  normalizeStepIn,
} from "../src/normalize";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a raw CwlSource around one or more documents. */
function makeSource(
  documents: CwlSourceDocument<Shape.Raw>[],
  entrypoint: string = documents[0]?.name ?? "",
  parameters: CwlSourceParameter[] = [],
): CwlSource<Shape.Raw> {
  return { entrypoint, documents, parameters };
}

/** A single-document raw source whose entrypoint matches that document. */
function singleDocSource(
  name: string,
  content: CwlSourceDocument<Shape.Raw>["content"],
): CwlSource<Shape.Raw> {
  return makeSource([{ name, content }], name);
}

/** Parse a single raw document and return its sanitized active file. */
async function activeFileOf(
  name: string,
  content: CwlSourceDocument<Shape.Raw>["content"],
) {
  return (await CWLSourceHolder.create(singleDocSource(name, content)))
    .activeFile;
}

const WORKFLOW_YAML = `
class: Workflow
cwlVersion: v1.2
inputs:
  message: string
outputs:
  result:
    type: File
    outputSource: step1/out
steps:
  step1:
    run: echo.cwl
    in:
      text: message
    out:
      - out
`;

// ===========================================================================
// Standalone helper: normalizeInput
// ===========================================================================

describe("normalizeInput", () => {
  it("expands a string shorthand into { id, type }", () => {
    expect(normalizeInput("string", "msg")).toEqual({
      id: "msg",
      type: "string",
    });
  });

  it("supports array/optional shorthand type strings", () => {
    expect(normalizeInput("File[]", "files")).toEqual({
      id: "files",
      type: "File[]",
    });
    expect(normalizeInput("string?", "maybe")).toEqual({
      id: "maybe",
      type: "string?",
    });
  });

  it("wraps a union-type list shorthand under `type` (mapPredicate), not spread", () => {
    // `myinput: ["null", "File"]` is the map-form union-type shorthand: per
    // Schema Salad a non-mapping value (here a list) is assigned to the
    // `mapPredicate` field (`type`), it is not spread as if it were an entry.
    expect(normalizeInput(["null", "File"] as never, "myinput")).toEqual({
      id: "myinput",
      type: ["null", "File"],
    });
  });

  it("stamps the key onto an object input and preserves every property", () => {
    expect(
      normalizeInput(
        {
          type: "int",
          default: "5",
          inputBinding: { position: 1, prefix: "-n" },
          label: "count",
          doc: "how many",
        },
        "n",
      ),
    ).toEqual({
      id: "n",
      type: "int",
      default: "5",
      inputBinding: { position: 1, prefix: "-n" },
      label: "count",
      doc: "how many",
    });
  });

  it("overwrites an existing object id with the record key", () => {
    expect(normalizeInput({ type: "int", id: "old" } as never, "new")).toEqual({
      id: "new",
      type: "int",
    });
  });

  it("throws on a value that is neither a type string, type list, nor object", () => {
    // these are invalid Input shapes — the parser rejects rather than leaking them
    expect(() => normalizeInput(undefined as never, "x")).toThrow(
      /Input "x" has an invalid value/,
    );
    expect(() => normalizeInput(42 as never, "x")).toThrow(
      /Input "x" has an invalid value/,
    );
  });

  it("does not mutate the source object", () => {
    const src = { type: "int" as const };
    normalizeInput(src, "n");
    expect(src).toEqual({ type: "int" });
    expect("id" in src).toBe(false);
  });
});

// ===========================================================================
// Standalone helper: normalizeOutput
// ===========================================================================

describe("normalizeOutput", () => {
  it("expands a string shorthand into { id, type }", () => {
    expect(normalizeOutput("File", "out")).toEqual({
      id: "out",
      type: "File",
    });
  });

  it("supports array/optional shorthand type strings", () => {
    expect(normalizeOutput("File[]", "files")).toEqual({
      id: "files",
      type: "File[]",
    });
    expect(normalizeOutput("File?", "maybe")).toEqual({
      id: "maybe",
      type: "File?",
    });
  });

  it("wraps a union-type list shorthand under `type` (mapPredicate), not spread", () => {
    expect(normalizeOutput(["null", "File"] as never, "out")).toEqual({
      id: "out",
      type: ["null", "File"],
    });
  });

  it("stamps the key onto an object output and preserves every property", () => {
    expect(
      normalizeOutput(
        {
          type: "File",
          outputBinding: { glob: "*.txt" },
          outputSource: "step/out",
          secondaryFiles: ".bai",
          format: "edam:format_1234",
          streamable: true,
          doc: "the output",
          label: "Out",
        } as never,
        "out",
      ),
    ).toEqual({
      id: "out",
      type: "File",
      outputBinding: { glob: "*.txt" },
      outputSource: "step/out",
      secondaryFiles: ".bai",
      format: "edam:format_1234",
      streamable: true,
      doc: "the output",
      label: "Out",
    });
  });

  it("overwrites an existing object id with the record key", () => {
    expect(
      normalizeOutput({ type: "File", id: "old" } as never, "new"),
    ).toEqual({
      id: "new",
      type: "File",
    });
  });

  it("throws on a value that is neither a type string, type list, nor object", () => {
    expect(() => normalizeOutput(undefined as never, "x")).toThrow(
      /Output "x" has an invalid value/,
    );
    expect(() => normalizeOutput(42 as never, "x")).toThrow(
      /Output "x" has an invalid value/,
    );
  });

  it("does not mutate the source object", () => {
    const src = { type: "File" as const };
    normalizeOutput(src, "out");
    expect(src).toEqual({ type: "File" });
    expect("id" in src).toBe(false);
  });
});

// ===========================================================================
// Standalone helper: normalizeStepIn
// ===========================================================================

describe("normalizeStepIn", () => {
  it("expands a string step-in into { source }", () => {
    expect(normalizeStepIn({ a: "src" })).toEqual({ a: { source: "src" } });
  });

  it("passes an object step-in through unchanged, including all fields", () => {
    const stepIn = {
      a: {
        source: ["x", "y"],
        valueFrom: "$(self)",
        default: 1,
        linkMerge: "merge_flattened" as const,
      },
    };
    expect(normalizeStepIn(stepIn)).toEqual(stepIn);
  });

  it("wraps a list source shorthand under `source` (mapPredicate), not spread", () => {
    // `x: ["a/out", "b/out"]` is the map-form multi-source shorthand: the list
    // is assigned to `source`, not spread into an index-keyed object.
    expect(normalizeStepIn({ x: ["a/out", "b/out"] } as never)).toEqual({
      x: { source: ["a/out", "b/out"] },
    });
  });

  it("throws on an invalid step-input value (empty string / undefined / null)", () => {
    expect(() => normalizeStepIn({ a: "" } as never)).toThrow(
      /Step input "a" has an invalid value/,
    );
    expect(() => normalizeStepIn({ c: undefined } as never)).toThrow(
      /Step input "c" has an invalid value/,
    );
    expect(() => normalizeStepIn({ d: null } as never)).toThrow(
      /Step input "d" has an invalid value/,
    );
  });

  it("returns an empty record for an empty mapping", () => {
    expect(normalizeStepIn({})).toEqual({});
  });

  it("normalizes a mix of string and object entries together", () => {
    expect(
      normalizeStepIn({ a: "srcA", b: { source: "srcB" } } as never),
    ).toEqual({ a: { source: "srcA" }, b: { source: "srcB" } });
  });

  it("accepts the array (list) form, keying by each entry's id and stripping it from the value", () => {
    expect(
      normalizeStepIn([
        { id: "a", source: "srcA" },
        { id: "b", source: ["x", "y"], linkMerge: "merge_flattened" },
      ] as never),
    ).toEqual({
      a: { source: "srcA" },
      b: { source: ["x", "y"], linkMerge: "merge_flattened" },
    });
  });

  it("throws when `in` is missing entirely", () => {
    expect(() => normalizeStepIn(undefined as never)).toThrow(
      /missing the required `in`/,
    );
  });

  it("throws when an array-form `in` entry omits its id", () => {
    expect(() => normalizeStepIn([{ source: "src" }] as never)).toThrow(
      /missing its required `id`/,
    );
  });
});

// ===========================================================================
// Standalone type guard: isPackedDocument
// ===========================================================================

describe("isPackedDocument", () => {
  it("is true for objects carrying a $graph (array or record)", () => {
    expect(isPackedDocument({ $graph: [] } as never)).toBe(true);
    expect(isPackedDocument({ $graph: {} } as never)).toBe(true);
  });

  it("checks key presence, not value — $graph: undefined is still packed", () => {
    expect(isPackedDocument({ $graph: undefined } as never)).toBe(true);
  });

  it("is false for a plain process/workflow", () => {
    expect(isPackedDocument({ class: "Workflow" } as never)).toBe(false);
    expect(isPackedDocument({ class: "CommandLineTool" } as never)).toBe(false);
  });

  it("is false for null, undefined, and non-object primitives", () => {
    expect(isPackedDocument(null as never)).toBe(false);
    expect(isPackedDocument(undefined as never)).toBe(false);
    expect(isPackedDocument("$graph" as never)).toBe(false);
  });

  it("is false for an array without a $graph key", () => {
    expect(isPackedDocument([] as never)).toBe(false);
  });
});

// ===========================================================================
// Standalone type guard: isWorkflow
// ===========================================================================

describe("isWorkflow", () => {
  it("is true only when class === 'Workflow'", () => {
    expect(isWorkflow({ class: "Workflow" })).toBe(true);
  });

  it("is false for every other process class", () => {
    expect(isWorkflow({ class: "CommandLineTool" })).toBe(false);
    expect(isWorkflow({ class: "ExpressionTool" })).toBe(false);
    expect(isWorkflow({ class: "Operation" })).toBe(false);
  });
});

// ===========================================================================
// CWLSourceHolder.create — parsing document content (format + content type)
// ===========================================================================

describe("CWLSourceHolder.create — parsing document content", () => {
  it("parses a YAML (.cwl) string document into a sanitized workflow", async () => {
    const wf = (await activeFileOf("workflow.cwl", WORKFLOW_YAML)) as Workflow;
    expect(wf.class).toBe("Workflow");
    expect(wf.inputs?.message).toEqual({ id: "message", type: "string" });
    expect(wf.outputs.result).toEqual({
      id: "result",
      type: "File",
      outputSource: "step1/out",
    });
  });

  it("parses a .yaml string document", async () => {
    const wf = (await activeFileOf("workflow.yaml", WORKFLOW_YAML)) as Workflow;
    expect(wf.class).toBe("Workflow");
  });

  it("parses a .yml string document", async () => {
    const wf = (await activeFileOf("workflow.yml", WORKFLOW_YAML)) as Workflow;
    expect(wf.class).toBe("Workflow");
  });

  it("parses a JSON (.json) string document", async () => {
    const json = JSON.stringify({
      class: "CommandLineTool",
      id: "tool-1",
      baseCommand: "echo",
      inputs: { msg: "string" },
      outputs: { out: { type: "File" } },
    });

    const tool = (await activeFileOf("tool.json", json)) as Process;
    expect(tool.class).toBe("CommandLineTool");
    expect(tool.id).toBe("tool-1");
    expect(tool.inputs?.msg).toEqual({ id: "msg", type: "string" });
    expect(tool.outputs?.out).toEqual({ id: "out", type: "File" });
  });

  it("reads a File whose content is YAML", async () => {
    const file = new File([WORKFLOW_YAML], "workflow.cwl");
    const wf = (await activeFileOf("workflow.cwl", file)) as Workflow;
    expect(wf.class).toBe("Workflow");
    expect(wf.steps?.step1?.run).toBe("echo.cwl");
  });

  it("reads a File whose content is JSON", async () => {
    const file = new File(
      [JSON.stringify({ class: "CommandLineTool", id: "t", inputs: {} })],
      "tool.json",
    );
    expect(((await activeFileOf("tool.json", file)) as Process).id).toBe("t");
  });

  it("accepts an already-parsed object as content", async () => {
    const wf = (await activeFileOf("workflow.cwl", {
      class: "Workflow",
      inputs: { x: "int" },
      outputs: {},
      steps: {},
    })) as Workflow;
    expect(wf.inputs?.x).toEqual({ id: "x", type: "int" });
  });

  it("detects the format case-insensitively for every extension", async () => {
    const json = JSON.stringify({
      class: "CommandLineTool",
      id: "t",
      inputs: {},
    });
    expect(
      ((await activeFileOf("Workflow.CWL", WORKFLOW_YAML)) as Workflow).class,
    ).toBe("Workflow");
    expect(
      ((await activeFileOf("Workflow.YAML", WORKFLOW_YAML)) as Workflow).class,
    ).toBe("Workflow");
    expect(
      ((await activeFileOf("Workflow.YML", WORKFLOW_YAML)) as Workflow).class,
    ).toBe("Workflow");
    expect(((await activeFileOf("Tool.JSON", json)) as Process).id).toBe("t");
  });

  it("preserves every top-level CommandLineTool property", async () => {
    const tool = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      id: "full",
      cwlVersion: "v1.2",
      baseCommand: "echo",
      arguments: ["-n"],
      requirements: { DockerRequirement: { dockerPull: "alpine" } },
      hints: [{ class: "ResourceRequirement" }],
      label: "L",
      doc: "D",
      stdout: "out.txt",
      inputs: { a: "string" },
      outputs: { o: { type: "File" } },
    } as Process<Shape.Raw>)) as Process;

    expect(tool).toMatchObject({
      id: "full",
      cwlVersion: "v1.2",
      baseCommand: "echo",
      arguments: ["-n"],
      requirements: { DockerRequirement: { dockerPull: "alpine" } },
      hints: [{ class: "ResourceRequirement" }],
      label: "L",
      doc: "D",
      stdout: "out.txt",
    });
    expect(tool.inputs?.a).toEqual({ id: "a", type: "string" });
    expect(tool.outputs?.o).toEqual({ id: "o", type: "File" });
  });

  it("preserves an ExpressionTool's expression and gives it a class-prefixed id", async () => {
    const tool = (await activeFileOf("expr.cwl", {
      class: "ExpressionTool",
      expression: "$(inputs.x)",
      inputs: { x: "int" },
      outputs: {},
    } as Process<Shape.Raw>)) as Process & { expression: unknown };

    expect(tool.class).toBe("ExpressionTool");
    expect(tool.expression).toBe("$(inputs.x)");
    expect(tool.id).toMatch(/^expressiontool_/);
  });

  it("does not mutate the caller's raw object", async () => {
    const raw: Process<Shape.Raw> = {
      class: "CommandLineTool",
      inputs: { a: "string" },
      outputs: {},
    };
    await CWLSourceHolder.create(singleDocSource("tool.cwl", raw));
    // shorthand input is still a string on the original object (authored as a
    // record, so narrow away the array branch of the raw `inputs` union)
    expect((raw.inputs as Record<string, string>).a).toBe("string");
    expect("id" in raw).toBe(false);
  });
});

// ===========================================================================
// CWLSourceHolder.create — inputs normalization
// ===========================================================================

describe("CWLSourceHolder.create — inputs", () => {
  it("expands string-shorthand inputs and stamps each id from its key", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: { a: "string", b: "int" },
      outputs: {},
    })) as Process;
    expect(p.inputs?.a).toEqual({ id: "a", type: "string" });
    expect(p.inputs?.b).toEqual({ id: "b", type: "int" });
  });

  it("keeps object-input properties and stamps id from the key", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: { a: { type: "int", default: "3", label: "L" } },
      outputs: {},
    })) as Process;
    expect(p.inputs?.a).toEqual({
      id: "a",
      type: "int",
      default: "3",
      label: "L",
    });
  });

  it("overrides an object-input's own id with its record key", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: { a: { type: "int", id: "wrong" } as never },
      outputs: {},
    })) as Process;
    expect(p.inputs?.a.id).toBe("a");
  });

  it("yields an empty inputs record when the process declares none", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      outputs: {},
    } as Process<Shape.Raw>)) as Process;
    expect(p.inputs).toEqual({});
  });
});

// ===========================================================================
// CWLSourceHolder.create — outputs normalization
// ===========================================================================

describe("CWLSourceHolder.create — outputs", () => {
  it("expands a string-shorthand output into { id, type }", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: {},
      outputs: { out: "File", many: "File[]" } as never,
    })) as Process;
    expect(p.outputs?.out).toEqual({ id: "out", type: "File" });
    expect(p.outputs?.many).toEqual({ id: "many", type: "File[]" });
  });

  it("stamps each output id from its key", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: {},
      outputs: { out: { type: "File" } },
    })) as Process;
    expect(p.outputs?.out).toEqual({ id: "out", type: "File" });
  });

  it("preserves every output property while stamping the id", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: {},
      outputs: {
        out: {
          type: "File",
          outputBinding: { glob: "*.txt" },
          outputSource: "step/out",
          secondaryFiles: ".bai",
          format: "edam:format_1234",
          streamable: true,
          doc: "the output",
          label: "Out",
        },
      },
    } as Process<Shape.Raw>)) as Process;
    expect(p.outputs?.out).toMatchObject({
      id: "out",
      type: "File",
      outputBinding: { glob: "*.txt" },
      outputSource: "step/out",
      secondaryFiles: ".bai",
      format: "edam:format_1234",
      streamable: true,
      doc: "the output",
      label: "Out",
    });
  });

  it("overrides an output's own id with its record key", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: {},
      outputs: { out: { type: "File", id: "wrong" } as never },
    })) as Process;
    expect((p.outputs?.out as { id?: string }).id).toBe("out");
  });

  it("yields an empty outputs record when the process declares none", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: {},
    } as Process<Shape.Raw>)) as Process;
    expect(p.outputs).toEqual({});
  });
});

// ===========================================================================
// CWLSourceHolder.create — workflow step normalization
// ===========================================================================

describe("CWLSourceHolder.create — step normalization", () => {
  it("normalizes step `in` shorthand and stamps the step id from its key", async () => {
    const step = (
      (await activeFileOf("workflow.cwl", WORKFLOW_YAML)) as Workflow
    ).steps?.step1;
    expect(step?.id).toBe("step1");
    expect(step?.in.text).toEqual({ source: "message" });
    expect(step?.run).toBe("echo.cwl");
    expect(step?.out).toEqual(["out"]);
  });

  it("leaves a string `run` reference untouched", async () => {
    const step = (
      (await activeFileOf("workflow.cwl", {
        class: "Workflow",
        outputs: {},
        steps: { s: { run: "tool.cwl", in: {} } },
      })) as Workflow
    ).steps?.s;
    expect(step?.run).toBe("tool.cwl");
  });

  it("recursively sanitizes an inline (object) step `run` process", async () => {
    const run = (
      (await activeFileOf("workflow.cwl", {
        class: "Workflow",
        outputs: {},
        steps: {
          s: {
            run: {
              class: "CommandLineTool",
              inputs: { a: "int" },
              outputs: { out: { type: "int" } },
            },
            in: { a: "x" },
            out: ["out"],
          },
        },
      })) as Workflow
    ).steps?.s?.run as Process;

    expect(typeof run).toBe("object");
    expect(run.class).toBe("CommandLineTool");
    expect(run.inputs?.a).toEqual({ id: "a", type: "int" });
    expect(run.outputs?.out).toEqual({ id: "out", type: "int" });
    // inline run with no id gets a deterministic, class-prefixed fallback id
    expect(run.id).toMatch(/^commandlinetool_/);
  });

  it("recursively sanitizes a nested workflow used as a step `run`", async () => {
    const nested: Workflow<Shape.Raw> = {
      class: "Workflow",
      inputs: { inner: "string" },
      outputs: {},
      steps: { deep: { run: "deep.cwl", in: { v: "inner" } } },
    };

    const run = (
      (await activeFileOf("workflow.cwl", {
        class: "Workflow",
        outputs: {},
        steps: { s: { run: nested, in: {} } },
      })) as Workflow
    ).steps?.s?.run as Workflow;

    expect(run.class).toBe("Workflow");
    expect(run.id).toMatch(/^workflow_/);
    expect(run.inputs?.inner).toEqual({ id: "inner", type: "string" });
    // nested workflow's own steps are sanitized too
    expect(run.steps?.deep?.id).toBe("deep");
    expect(run.steps?.deep?.in.v).toEqual({ source: "inner" });
  });

  it("preserves the remaining step properties (out forms, scatter, requirements, hints, label, doc)", async () => {
    const step = (
      (await activeFileOf("workflow.cwl", {
        class: "Workflow",
        outputs: {},
        steps: {
          s: {
            run: "tool.cwl",
            in: { a: "x" },
            out: [{ id: "o1" }, "o2"],
            scatter: ["a"],
            scatterMethod: "dotproduct",
            requirements: [{ class: "InlineJavascriptRequirement" }],
            hints: [{ class: "ResourceRequirement" }],
            label: "Step",
            doc: "does a thing",
          },
        },
      } as Workflow<Shape.Raw>)) as Workflow
    ).steps?.s;

    expect(step).toMatchObject({
      out: [{ id: "o1" }, "o2"],
      scatter: ["a"],
      scatterMethod: "dotproduct",
      requirements: [{ class: "InlineJavascriptRequirement" }],
      hints: [{ class: "ResourceRequirement" }],
      label: "Step",
      doc: "does a thing",
    });
  });

  it("normalizes every step of a multi-step workflow", async () => {
    const wf = (await activeFileOf("workflow.cwl", {
      class: "Workflow",
      outputs: {},
      steps: {
        a: { run: "a.cwl", in: { x: "in1" } },
        b: { run: "b.cwl", in: { y: "a/out" } },
      },
    })) as Workflow;

    expect(wf.steps?.a?.id).toBe("a");
    expect(wf.steps?.b?.id).toBe("b");
    expect(wf.steps?.a?.in.x).toEqual({ source: "in1" });
    expect(wf.steps?.b?.in.y).toEqual({ source: "a/out" });
  });

  it("yields an empty steps record for a workflow with no steps", async () => {
    const wf = (await activeFileOf("workflow.cwl", {
      class: "Workflow",
      outputs: {},
    } as Workflow<Shape.Raw>)) as Workflow;
    expect(wf.steps).toEqual({});
  });
});

// ===========================================================================
// CWLSourceHolder.create — array (list) form of inputs/outputs/steps
//
// CWL lets `inputs`, `outputs`, `steps` and a step's `in` be authored either as
// an identifier map or as the equivalent array of id-bearing entries; the spec
// requires consumers to accept both. These cover the array form.
// ===========================================================================

describe("CWLSourceHolder.create — array (list) form", () => {
  it("keys array-form inputs by each entry's own id (not the array index)", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: [
        { id: "message", type: "string" },
        { id: "count", type: "int", default: "1" },
      ] as never,
      outputs: {},
    })) as Process;

    expect(Object.keys(p.inputs ?? {}).sort()).toEqual(["count", "message"]);
    expect(p.inputs?.message).toEqual({ id: "message", type: "string" });
    expect(p.inputs?.count).toEqual({ id: "count", type: "int", default: "1" });
  });

  it("keys array-form outputs by each entry's own id", async () => {
    const p = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: {},
      outputs: [
        { id: "out", type: "File", outputBinding: { glob: "*.txt" } },
      ] as never,
    })) as Process;

    expect(p.outputs?.out).toEqual({
      id: "out",
      type: "File",
      outputBinding: { glob: "*.txt" },
    });
  });

  it("keys array-form steps by each entry's own id and normalizes their `in`", async () => {
    const wf = (await activeFileOf("workflow.cwl", {
      class: "Workflow",
      outputs: {},
      steps: [
        { id: "step1", run: "echo.cwl", in: { text: "message" } },
        { id: "step2", run: "cat.cwl", in: { f: "step1/out" } },
      ] as never,
    })) as Workflow;

    expect(Object.keys(wf.steps ?? {}).sort()).toEqual(["step1", "step2"]);
    expect(wf.steps?.step1?.id).toBe("step1");
    expect(wf.steps?.step1?.in.text).toEqual({ source: "message" });
    expect(wf.steps?.step2?.in.f).toEqual({ source: "step1/out" });
  });

  it("accepts a step `in` authored as an array", async () => {
    const wf = (await activeFileOf("workflow.cwl", {
      class: "Workflow",
      outputs: {},
      steps: {
        s: {
          run: "tool.cwl",
          in: [
            { id: "text", source: "message" },
            { id: "n", default: 5 },
          ],
        } as never,
      },
    })) as Workflow;

    expect(wf.steps?.s?.in.text).toEqual({ source: "message" });
    expect(wf.steps?.s?.in.n).toEqual({ default: 5 });
  });

  it("throws when an array-form input entry omits its required id", async () => {
    await expect(
      CWLSourceHolder.create(
        singleDocSource("tool.cwl", {
          class: "CommandLineTool",
          inputs: [{ type: "string" }] as never,
          outputs: {},
        }),
      ),
    ).rejects.toThrow(/missing its required `id`/);
  });

  it("throws when an array-form step omits its required id", async () => {
    await expect(
      CWLSourceHolder.create(
        singleDocSource("workflow.cwl", {
          class: "Workflow",
          outputs: {},
          steps: [{ run: "tool.cwl", in: {} }] as never,
        }),
      ),
    ).rejects.toThrow(/missing its required `id`/);
  });

  it("parses a fully array-form workflow document (YAML)", async () => {
    const yaml = `
class: Workflow
cwlVersion: v1.2
inputs:
  - id: message
    type: string
outputs:
  - id: result
    type: File
    outputSource: step1/out
steps:
  - id: step1
    run: echo.cwl
    in:
      - id: text
        source: message
    out: [out]
`;

    const wf = (await activeFileOf("workflow.cwl", yaml)) as Workflow;

    expect(wf.inputs?.message).toEqual({ id: "message", type: "string" });
    expect(wf.outputs.result).toEqual({
      id: "result",
      type: "File",
      outputSource: "step1/out",
    });
    expect(wf.steps?.step1?.id).toBe("step1");
    expect(wf.steps?.step1?.in.text).toEqual({ source: "message" });
    expect(wf.steps?.step1?.out).toEqual(["out"]);
  });
});

// ===========================================================================
// CWLSourceHolder.create — fallback id generation (buildFallbackId_)
// ===========================================================================

describe("CWLSourceHolder.create — fallback id generation", () => {
  it("preserves an explicit workflow id", async () => {
    const wf = (await activeFileOf("workflow.cwl", {
      class: "Workflow",
      id: "my-workflow",
      outputs: {},
      steps: {},
    })) as Workflow;
    expect(wf.id).toBe("my-workflow");
  });

  it("generates a `workflow_`-prefixed fallback id when a workflow has none", async () => {
    const wf = (await activeFileOf("workflow.cwl", {
      class: "Workflow",
      outputs: {},
      steps: {},
    })) as Workflow;
    expect(wf.id).toMatch(/^workflow_/);
  });

  it("generates a class-prefixed fallback id for non-workflow processes", async () => {
    const tool = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      inputs: {},
      outputs: {},
    })) as Process;
    expect(tool.id).toMatch(/^commandlinetool_/);

    const expr = (await activeFileOf("expr.cwl", {
      class: "ExpressionTool",
      expression: "$(1)",
      inputs: {},
      outputs: {},
    } as Process<Shape.Raw>)) as Process;
    expect(expr.id).toMatch(/^expressiontool_/);

    const op = (await activeFileOf("op.cwl", {
      class: "Operation",
      inputs: {},
      outputs: {},
    } as Process<Shape.Raw>)) as Process;
    expect(op.id).toMatch(/^operation_/);
  });

  it("is deterministic across repeated parses of the same id-less process", async () => {
    const content: CwlSourceDocument<Shape.Raw>["content"] = {
      class: "CommandLineTool",
      inputs: { a: "string" },
      outputs: { out: { type: "File" } },
    };
    const first = ((await activeFileOf("tool.cwl", content)) as Process).id;
    const second = ((await activeFileOf("tool.cwl", content)) as Process).id;
    expect(first).toBe(second);
  });

  it("derives different ids from different input/output signatures", async () => {
    const a = (
      (await activeFileOf("a.cwl", {
        class: "CommandLineTool",
        inputs: { a: "string" },
        outputs: {},
      })) as Process
    ).id;
    const b = (
      (await activeFileOf("b.cwl", {
        class: "CommandLineTool",
        inputs: { b: "string" },
        outputs: {},
      })) as Process
    ).id;
    expect(a).not.toBe(b);
  });

  it("factors the label into the generated id", async () => {
    const noLabel = (
      (await activeFileOf("a.cwl", {
        class: "CommandLineTool",
        inputs: {},
        outputs: {},
      })) as Process
    ).id;
    const withLabel = (
      (await activeFileOf("b.cwl", {
        class: "CommandLineTool",
        label: "labelled",
        inputs: {},
        outputs: {},
      } as Process<Shape.Raw>)) as Process
    ).id;
    expect(noLabel).not.toBe(withLabel);
  });

  it("treats an explicit empty-string id as missing and generates a fallback", async () => {
    const tool = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      id: "",
      inputs: {},
      outputs: {},
    } as Process<Shape.Raw>)) as Process;
    expect(tool.id).toMatch(/^commandlinetool_/);
  });

  it("treats a whitespace-only id as missing and generates a fallback", async () => {
    const tool = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      id: "   ",
      inputs: {},
      outputs: {},
    } as Process<Shape.Raw>)) as Process;
    expect(tool.id).toMatch(/^commandlinetool_/);
  });

  it("preserves a non-blank id verbatim (no trimming)", async () => {
    const tool = (await activeFileOf("tool.cwl", {
      class: "CommandLineTool",
      id: "  spaced-id  ",
      inputs: {},
      outputs: {},
    } as Process<Shape.Raw>)) as Process;
    expect(tool.id).toBe("  spaced-id  ");
  });
});

// ===========================================================================
// CWLSourceHolder.create — packed ($graph) documents
// ===========================================================================

describe("CWLSourceHolder.create — packed $graph documents", () => {
  it("flattens an array $graph into a record keyed by each entry's id", async () => {
    const packed = (await activeFileOf("packed.cwl", {
      class: "Workflow",
      cwlVersion: "v1.2",
      $graph: [
        { id: "main", class: "Workflow", outputs: {}, steps: {} },
        { id: "tool", class: "CommandLineTool", inputs: { a: "string" } },
      ],
    })) as CWLPackedDocument;

    expect(isPackedDocument(packed)).toBe(true);
    expect(Object.keys(packed.$graph).sort()).toEqual(["main", "tool"]);
    expect(packed.$graph.main?.id).toBe("main");
    expect((packed.$graph.tool as Process).inputs?.a).toEqual({
      id: "a",
      type: "string",
    });
  });

  it("keeps a record $graph and sanitizes each entry", async () => {
    const packed = (await activeFileOf("packed.cwl", {
      class: "Workflow",
      cwlVersion: "v1.2",
      $graph: {
        main: { id: "main", class: "Workflow", outputs: {}, steps: {} },
        tool: { id: "tool", class: "CommandLineTool", inputs: { a: "string" } },
      },
    })) as CWLPackedDocument;

    expect(Object.keys(packed.$graph).sort()).toEqual(["main", "tool"]);
    expect((packed.$graph.tool as Process).inputs?.a).toEqual({
      id: "a",
      type: "string",
    });
  });

  it("sanitizes the steps of a workflow entry inside a packed $graph", async () => {
    const packed = (await activeFileOf("packed.cwl", {
      class: "Workflow",
      cwlVersion: "v1.2",
      $graph: [
        {
          id: "main",
          class: "Workflow",
          outputs: {},
          steps: { s: { run: "#tool", in: { a: "x" } } },
        },
        { id: "tool", class: "CommandLineTool", inputs: { a: "string" } },
      ],
    })) as CWLPackedDocument;

    const main = packed.$graph.main as Workflow;
    expect(main.steps?.s?.id).toBe("s");
    expect(main.steps?.s?.in.a).toEqual({ source: "x" });
  });

  it("preserves the packed document's own top-level properties", async () => {
    const packed = (await activeFileOf("packed.cwl", {
      class: "Workflow",
      cwlVersion: "v1.2",
      entryPoint: "#main",
      $graph: [{ id: "main", class: "Workflow", outputs: {}, steps: {} }],
    } as CWLPackedDocument<Shape.Raw>)) as CWLPackedDocument;

    expect(packed.cwlVersion).toBe("v1.2");
    expect(packed.entryPoint).toBe("#main");
  });

  it("re-stamps a record $graph entry's id from its graph key", async () => {
    // `$graph` is a `mapSubject: id` field, so the record key is the canonical
    // id and is stamped onto the entry even when it declares none.
    const packed = (await activeFileOf("packed.cwl", {
      class: "Workflow",
      cwlVersion: "v1.2",
      $graph: { main: { class: "Workflow", outputs: {}, steps: {} } as never },
    })) as CWLPackedDocument;

    expect(Object.keys(packed.$graph)).toEqual(["main"]);
    expect(packed.$graph.main?.id).toBe("main");
  });

  it("rejects an array $graph entry that omits its required id", async () => {
    await expect(
      CWLSourceHolder.create(
        singleDocSource("packed.cwl", {
          class: "Workflow",
          cwlVersion: "v1.2",
          $graph: [{ class: "CommandLineTool", inputs: {} } as never],
        }),
      ),
    ).rejects.toThrow(/missing its required `id`/);
  });

  it("rejects two array $graph entries that share an id", async () => {
    await expect(
      CWLSourceHolder.create(
        singleDocSource("packed.cwl", {
          class: "Workflow",
          cwlVersion: "v1.2",
          $graph: [
            { id: "dup", class: "CommandLineTool", inputs: {} },
            { id: "dup", class: "CommandLineTool", inputs: {} },
          ] as never,
        }),
      ),
    ).rejects.toThrow(/more than one entry with id/);
  });
});

// ===========================================================================
// CWLSourceHolder.create — source assembly, activeFile & parameters
// ===========================================================================

describe("CWLSourceHolder.create — source assembly", () => {
  it("preserves the entrypoint and keeps every sanitized document", async () => {
    const source = makeSource(
      [
        {
          name: "a.cwl",
          content: { class: "Workflow", outputs: {}, steps: {} },
        },
        { name: "b.cwl", content: { class: "CommandLineTool", inputs: {} } },
      ],
      "a.cwl",
    );

    const holder = await CWLSourceHolder.create(source);

    expect(holder.source.entrypoint).toBe("a.cwl");
    expect(holder.source.documents.map((d) => d.name)).toEqual([
      "a.cwl",
      "b.cwl",
    ]);
  });

  it("sanitizes non-entrypoint documents too, not only the active one", async () => {
    const source = makeSource(
      [
        {
          name: "a.cwl",
          content: { class: "Workflow", outputs: {}, steps: {} },
        },
        {
          name: "b.cwl",
          content: { class: "CommandLineTool", inputs: { a: "string" } },
        },
      ],
      "a.cwl",
    );

    const holder = await CWLSourceHolder.create(source);
    const second = holder.source.documents[1]?.content as Process;
    expect(second.inputs?.a).toEqual({ id: "a", type: "string" });
  });

  it("resolves activeFile to the document whose name matches the entrypoint", async () => {
    const source = makeSource(
      [
        {
          name: "a.cwl",
          content: { class: "Workflow", outputs: {}, steps: {} },
        },
        {
          name: "b.cwl",
          content: { class: "CommandLineTool", id: "the-tool", inputs: {} },
        },
      ],
      "b.cwl",
    );

    const holder = await CWLSourceHolder.create(source);
    expect((holder.activeFile as Process).id).toBe("the-tool");
  });

  it("leaves activeFile undefined when no document matches the entrypoint", async () => {
    const source = makeSource(
      [
        {
          name: "a.cwl",
          content: { class: "Workflow", outputs: {}, steps: {} },
        },
      ],
      "does-not-exist.cwl",
    );

    const holder = await CWLSourceHolder.create(source);
    expect(holder.activeFile).toBeUndefined();
  });

  it("handles an empty documents list (no active file, no throw)", async () => {
    const holder = await CWLSourceHolder.create(makeSource([], "anything.cwl"));
    expect(holder.source.documents).toEqual([]);
    expect(holder.activeFile).toBeUndefined();
  });
});

describe("CWLSourceHolder.create — parameters", () => {
  const doc: CwlSourceDocument<Shape.Raw> = {
    name: "a.cwl",
    content: { class: "Workflow", outputs: {}, steps: {} },
  };

  it("passes string parameter content through unchanged", async () => {
    const param: CwlSourceParameter = {
      name: "inputs.json",
      content: '{"message":"hello"}',
    };
    const holder = await CWLSourceHolder.create(
      makeSource([doc], "a.cwl", [param]),
    );
    expect(holder.source.parameters).toEqual([param]);
  });

  it("accepts every supported parameter extension as a string", async () => {
    const params: CwlSourceParameter[] = [
      { name: "p.json", content: "{}" },
      { name: "p.yaml", content: "{}" },
      { name: "p.yml", content: "{}" },
      { name: "p.cwl", content: "{}" },
    ];
    const holder = await CWLSourceHolder.create(
      makeSource([doc], "a.cwl", params),
    );
    expect(holder.source.parameters).toEqual(params);
  });

  it("reads File parameter content to text without parsing it", async () => {
    const text = '{"message":"hello"}';
    const holder = await CWLSourceHolder.create(
      makeSource([doc], "a.cwl", [
        { name: "inputs.json", content: new File([text], "inputs.json") },
      ]),
    );
    expect(holder.source.parameters[0]?.content).toBe(text);
  });

  it("normalizes multiple parameters together", async () => {
    const holder = await CWLSourceHolder.create(
      makeSource([doc], "a.cwl", [
        { name: "a.json", content: "{}" },
        { name: "b.yaml", content: new File(["k: v"], "b.yaml") },
      ]),
    );
    expect(holder.source.parameters[0]?.content).toBe("{}");
    expect(holder.source.parameters[1]?.content).toBe("k: v");
  });
});

// ===========================================================================
// CWLSourceHolder.create — error handling
// ===========================================================================

describe("CWLSourceHolder.create — invalid input", () => {
  it("rejects an empty-string document name", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource([{ name: "", content: WORKFLOW_YAML }]),
      ),
    ).rejects.toThrow(/`name` must be a non-empty string/);
  });

  it("rejects a whitespace-only document name", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource([{ name: "   ", content: WORKFLOW_YAML }]),
      ),
    ).rejects.toThrow(/`name` must be a non-empty string/);
  });

  it("rejects a non-string document name (null, number, object) without a TypeError", async () => {
    for (const badName of [null, undefined, 42, { toString: () => "x.cwl" }]) {
      await expect(
        CWLSourceHolder.create(
          makeSource([
            {
              name: badName as unknown as string,
              content: WORKFLOW_YAML,
            },
          ]),
        ),
      ).rejects.toThrow(/`name` must be a non-empty string/);
    }
  });

  it("rejects a document missing its content", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource([{ name: "a.cwl", content: undefined }]),
      ),
    ).rejects.toThrow(/missing the content/);
  });

  it("rejects an empty-string document content as missing", async () => {
    await expect(
      CWLSourceHolder.create(makeSource([{ name: "a.cwl", content: "" }])),
    ).rejects.toThrow(/missing the content/);
  });

  it("rejects a document with an unsupported extension", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource([{ name: "a.svg", content: WORKFLOW_YAML }]),
      ),
    ).rejects.toThrow(/unsupported format/);
  });

  it("rejects a document with no extension at all", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource([{ name: "noext", content: WORKFLOW_YAML }]),
      ),
    ).rejects.toThrow(/unsupported format/);
  });

  it("rejects a document whose content is neither string, File, nor object", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource([
          {
            name: "a.cwl",
            content: 42 as unknown as CwlSourceDocument<Shape.Raw>["content"],
          },
        ]),
      ),
    ).rejects.toThrow(/invalid content/);
  });

  it("reports the document name and format on malformed .json content", async () => {
    await expect(
      CWLSourceHolder.create(singleDocSource("bad.json", "{ not valid json")),
    ).rejects.toThrow(/Document named bad\.json is not valid json/);
  });

  it("reports the document name and format on malformed .cwl (yaml) content", async () => {
    await expect(
      CWLSourceHolder.create(singleDocSource("bad.cwl", "key: : :")),
    ).rejects.toThrow(/Document named bad\.cwl is not valid yaml/);
  });

  it("rejects a process that is missing its required `class`", async () => {
    await expect(
      CWLSourceHolder.create(
        singleDocSource("a.cwl", { inputs: {}, outputs: {} } as never),
      ),
    ).rejects.toThrow(/missing the required `class`/);
  });

  it("rejects a process whose `class` is not a known CWL process class", async () => {
    await expect(
      CWLSourceHolder.create(
        singleDocSource("a.cwl", {
          class: "Banana",
          inputs: {},
          outputs: {},
        } as never),
      ),
    ).rejects.toThrow(/unknown 'class' field "Banana"/);
  });

  it("rejects an inline step `run` process that is missing its `class`", async () => {
    await expect(
      CWLSourceHolder.create(
        singleDocSource("workflow.cwl", {
          class: "Workflow",
          outputs: {},
          steps: { s: { run: { inputs: {} } as never, in: {} } },
        }),
      ),
    ).rejects.toThrow(/missing the required `class`/);
  });

  it("rejects a workflow step whose `run` is an array with a clear error (not a class error)", async () => {
    await expect(
      CWLSourceHolder.create(
        singleDocSource("workflow.cwl", {
          class: "Workflow",
          outputs: {},
          steps: { s: { run: [] as never, in: {} } },
        }),
      ),
    ).rejects.toThrow(/invalid `run`/);
  });

  it("rejects a parameter missing its name", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource(
          [
            {
              name: "a.cwl",
              content: { class: "Workflow", outputs: {}, steps: {} },
            },
          ],
          "a.cwl",
          [{ name: "", content: "{}" }],
        ),
      ),
    ).rejects.toThrow(/`name` must be a non-empty string/);
  });

  it("rejects a parameter missing its content", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource(
          [
            {
              name: "a.cwl",
              content: { class: "Workflow", outputs: {}, steps: {} },
            },
          ],
          "a.cwl",
          [{ name: "inputs.json", content: undefined }],
        ),
      ),
    ).rejects.toThrow(/Parameter item is missing the content/);
  });

  it("rejects a parameter whose content is neither string nor File", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource(
          [
            {
              name: "a.cwl",
              content: { class: "Workflow", outputs: {}, steps: {} },
            },
          ],
          "a.cwl",
          [
            {
              name: "inputs.json",
              content: 42 as unknown as CwlSourceParameter["content"],
            },
          ],
        ),
      ),
    ).rejects.toThrow(/invalid content/);
  });

  it("rejects a parameter with an unsupported extension", async () => {
    await expect(
      CWLSourceHolder.create(
        makeSource(
          [
            {
              name: "a.cwl",
              content: { class: "Workflow", outputs: {}, steps: {} },
            },
          ],
          "a.cwl",
          [{ name: "inputs.svg", content: "{}" }],
        ),
      ),
    ).rejects.toThrow(/unsupported format/);
  });
});

// ===========================================================================
// CWLSourceHolder.create — known sharp edges (current behavior, see review)
//
// These assert what the parser does TODAY, not necessarily what it should do.
// They guard the documented quirks so a future fix is a deliberate, visible
// change rather than a silent one.
// ===========================================================================

describe("CWLSourceHolder.create — known sharp edges", () => {
  it("throws when a workflow step omits its required `in` mapping", async () => {
    // normalizeStepIn rejects a missing `in` with an explicit error.
    await expect(
      CWLSourceHolder.create(
        singleDocSource("workflow.cwl", {
          class: "Workflow",
          outputs: {},
          steps: { s: { run: "tool.cwl", out: ["o"] } as never },
        }),
      ),
    ).rejects.toThrow(/missing the required `in`/);
  });

  it("throws a clear error when a workflow step omits its required `run`", async () => {
    // A missing `run` used to recurse into sanitizeProcess_(undefined) and die
    // on `undefined.class`; it now fails with an explicit message.
    await expect(
      CWLSourceHolder.create(
        singleDocSource("workflow.cwl", {
          class: "Workflow",
          outputs: {},
          steps: { s: { in: {} } as never },
        }),
      ),
    ).rejects.toThrow(/missing the required `run`/);
  });
});
