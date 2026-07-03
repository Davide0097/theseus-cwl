import { describe, expect, it } from "vitest";

import { isPackedDocument, isWorkflow } from "../src/guards";

// ===========================================================================
// isPackedDocument
//
// A document is "packed" iff it is a non-null object that carries a `$graph`
// key. The guard is deliberately a *key-presence* check, not a value check.
// ===========================================================================

describe("isPackedDocument", () => {
  it("is true for an object carrying an array $graph", () => {
    expect(isPackedDocument({ $graph: [] } as never)).toBe(true);
  });

  it("is true for an object carrying a record $graph", () => {
    expect(isPackedDocument({ $graph: {} } as never)).toBe(true);
  });

  it("checks key presence, not value — $graph: undefined is still packed", () => {
    expect(isPackedDocument({ $graph: undefined } as never)).toBe(true);
  });

  it("checks key presence, not value — $graph: null is still packed", () => {
    expect(isPackedDocument({ $graph: null } as never)).toBe(true);
  });

  it("is still true when a $graph coexists with other top-level keys", () => {
    expect(isPackedDocument({ class: "Workflow", $graph: [] } as never)).toBe(
      true,
    );
  });

  it("is false for a plain workflow (no $graph)", () => {
    expect(isPackedDocument({ class: "Workflow" } as never)).toBe(false);
  });

  it("is false for a plain command line tool (no $graph)", () => {
    expect(isPackedDocument({ class: "CommandLineTool" } as never)).toBe(false);
  });

  it("is false for an empty object", () => {
    expect(isPackedDocument({} as never)).toBe(false);
  });

  it("is false for null", () => {
    expect(isPackedDocument(null as never)).toBe(false);
  });

  it("is false for undefined", () => {
    expect(isPackedDocument(undefined as never)).toBe(false);
  });

  it("is false for non-object primitives (string, number, boolean)", () => {
    expect(isPackedDocument("$graph" as never)).toBe(false);
    expect(isPackedDocument(42 as never)).toBe(false);
    expect(isPackedDocument(true as never)).toBe(false);
  });

  it("is false for a plain array without a $graph property", () => {
    expect(isPackedDocument([] as never)).toBe(false);
  });

  it("keys, not shape: an array that carries a $graph own-property is packed", () => {
    // Documents that the guard only asks `"$graph" in object`; it does not
    // exclude arrays. Not a realistic authored shape, but it pins the contract.
    const arrayWithGraph: unknown[] = [];
    (arrayWithGraph as { $graph?: unknown }).$graph = [];
    expect(isPackedDocument(arrayWithGraph as never)).toBe(true);
  });
});

// ===========================================================================
// isWorkflow
//
// Distinguishes a `Workflow` from every other process purely by an exact
// `class === "Workflow"` string match (case-sensitive).
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

  it("is case-sensitive — 'workflow' is not a Workflow", () => {
    expect(isWorkflow({ class: "workflow" } as never)).toBe(false);
  });

  it("is false for a near-miss class name", () => {
    expect(isWorkflow({ class: "WorkflowStep" } as never)).toBe(false);
  });

  it("is false when there is no class field at all", () => {
    expect(isWorkflow({} as never)).toBe(false);
  });
});
