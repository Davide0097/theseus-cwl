import { describe, expect, it } from "vitest";

import {
  normalizeInput,
  normalizeOutput,
  normalizeStepIn,
  toRecordById,
} from "../src/normalize";

// ===========================================================================
// normalizeInput
//
// Stamps the record key as `id` and expands the raw input shorthands:
//   - a type string ("string", "File[]", "string?")  → { id, type: <string> }
//   - a union-type list (["null", "File"])            → { id, type: <list> }
//   - a full object                                    → { ...object, id }
// Anything else is rejected. The record key always wins over an authored id.
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

  it("accepts an empty string as a (degenerate) type value", () => {
    // A string — even "" — is treated as a type shorthand, unlike a step-input
    // source where "" is rejected. This pins the asymmetry between the two.
    expect(normalizeInput("" as never, "x")).toEqual({ id: "x", type: "" });
  });

  it("throws on a value that is neither a type string, type list, nor object", () => {
    // these are invalid Input shapes — the parser rejects rather than leaking them
    expect(() => normalizeInput(undefined as never, "x")).toThrow(
      /input "x" has an invalid value/,
    );
    expect(() => normalizeInput(null as never, "x")).toThrow(
      /input "x" has an invalid value/,
    );
    expect(() => normalizeInput(42 as never, "x")).toThrow(
      /input "x" has an invalid value/,
    );
    expect(() => normalizeInput(true as never, "x")).toThrow(
      /input "x" has an invalid value/,
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
// normalizeOutput
//
// Same normalization contract as normalizeInput, but the error names the
// "output" field.
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

  it("accepts an empty string as a (degenerate) type value", () => {
    expect(normalizeOutput("" as never, "x")).toEqual({ id: "x", type: "" });
  });

  it("throws on a value that is neither a type string, type list, nor object", () => {
    expect(() => normalizeOutput(undefined as never, "x")).toThrow(
      /output "x" has an invalid value/,
    );
    expect(() => normalizeOutput(null as never, "x")).toThrow(
      /output "x" has an invalid value/,
    );
    expect(() => normalizeOutput(42 as never, "x")).toThrow(
      /output "x" has an invalid value/,
    );
    expect(() => normalizeOutput(true as never, "x")).toThrow(
      /output "x" has an invalid value/,
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
// normalizeStepIn
//
// Normalizes a workflow step's `in`. Each entry becomes a WorkflowStepInput:
//   - a source string ("msg")                → { source: "msg" }
//   - a source list (["a/out", "b/out"])     → { source: [...] }
//   - a full object                          → { ...object } with `id` stripped
// Accepts both the map and the list authoring forms. A missing `in` throws.
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

  it("drops an `id` carried on a map-form object entry (the key is canonical)", () => {
    // The map key is the id, so any `id` inside the value is redundant and is
    // stripped — this keeps the map and list authoring forms identical.
    expect(
      normalizeStepIn({ a: { id: "ignored", source: "src" } } as never),
    ).toEqual({ a: { source: "src" } });
  });

  it("wraps a list source shorthand under `source` (mapPredicate), not spread", () => {
    // `x: ["a/out", "b/out"]` is the map-form multi-source shorthand: the list
    // is assigned to `source`, not spread into an index-keyed object.
    expect(normalizeStepIn({ x: ["a/out", "b/out"] } as never)).toEqual({
      x: { source: ["a/out", "b/out"] },
    });
  });

  it("throws on an invalid step-input value (empty string / undefined / null / number)", () => {
    expect(() => normalizeStepIn({ a: "" } as never)).toThrow(
      /Step input "a" has an invalid value/,
    );
    expect(() => normalizeStepIn({ c: undefined } as never)).toThrow(
      /Step input "c" has an invalid value/,
    );
    expect(() => normalizeStepIn({ d: null } as never)).toThrow(
      /Step input "d" has an invalid value/,
    );
    expect(() => normalizeStepIn({ e: 42 } as never)).toThrow(
      /Step input "e" has an invalid value/,
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

  it("throws when `in` is missing entirely (undefined)", () => {
    expect(() => normalizeStepIn(undefined as never)).toThrow(
      /missing the required `in`/,
    );
  });

  it("throws when `in` is null", () => {
    expect(() => normalizeStepIn(null as never)).toThrow(
      /missing the required `in`/,
    );
  });

  it("throws when an array-form `in` entry omits its id", () => {
    expect(() => normalizeStepIn([{ source: "src" }] as never)).toThrow(
      /missing its required `id`/,
    );
  });

  it("throws when two array-form `in` entries share an id", () => {
    expect(() =>
      normalizeStepIn([
        { id: "dup", source: "a" },
        { id: "dup", source: "b" },
      ] as never),
    ).toThrow(/more than one entry with id "dup"/);
  });
});

// ===========================================================================
// toRecordById
//
// The map/list unifier used for inputs, outputs, steps and step `in`. Given a
// map or a list of id-bearing entries it returns a record keyed by id, running
// `normalize(entry, id)` over each. `undefined`/empty collapse to `{}`; list
// entries supply their own id; duplicate ids throw.
// ===========================================================================

describe("toRecordById", () => {
  const identity = (entry: unknown, id: string) => ({ entry, id });

  it("returns an empty record for an undefined field", () => {
    expect(toRecordById(undefined, identity)).toEqual({});
  });

  it("returns an empty record for an empty map", () => {
    expect(toRecordById({}, identity)).toEqual({});
  });

  it("returns an empty record for an empty list", () => {
    expect(toRecordById([], identity)).toEqual({});
  });

  it("keys a map by its own keys and passes (entry, key) to normalize", () => {
    expect(
      toRecordById({ a: { type: "string" }, b: { type: "int" } }, identity),
    ).toEqual({
      a: { entry: { type: "string" }, id: "a" },
      b: { entry: { type: "int" }, id: "b" },
    });
  });

  it("keys a list by each entry's own id and passes (entry, id) to normalize", () => {
    expect(
      toRecordById(
        [
          { id: "a", type: "string" },
          { id: "b", type: "int" },
        ],
        identity,
      ),
    ).toEqual({
      a: { entry: { id: "a", type: "string" }, id: "a" },
      b: { entry: { id: "b", type: "int" }, id: "b" },
    });
  });

  it("throws when two list entries share an id", () => {
    expect(() =>
      toRecordById(
        [
          { id: "dup", type: "string" },
          { id: "dup", type: "int" },
        ],
        identity,
      ),
    ).toThrow(/more than one entry with id "dup"/);
  });

  it("throws when a list entry omits its id", () => {
    expect(() => toRecordById([{ type: "string" }] as never, identity)).toThrow(
      /missing its required `id`/,
    );
  });

  it("throws when a list entry has a blank (whitespace-only) id", () => {
    expect(() =>
      toRecordById([{ id: "   ", type: "string" }] as never, identity),
    ).toThrow(/missing its required `id`/);
  });

  it("throws when a list entry is a primitive rather than an id-bearing object", () => {
    expect(() => toRecordById(["just-a-string"] as never, identity)).toThrow(
      /missing its required `id`/,
    );
  });
});
