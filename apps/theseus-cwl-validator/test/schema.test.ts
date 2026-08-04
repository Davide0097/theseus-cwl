import { describe, expect, it } from "vitest";

import { cwlSourceSchema } from "../src/schema";

const validSource = {
  entrypoint: "main.cwl",
  documents: [{ name: "main.cwl", content: "class: Workflow\n" }],
  parameters: [{ name: "job.json", content: '{"n":1}' }],
};

describe("cwlSourceSchema", () => {
  it("accepts a well-formed CwlSource", () => {
    const result = cwlSourceSchema.safeParse(validSource);
    expect(result.success).toBe(true);
  });

  it("defaults parameters to an empty array when omitted", () => {
    const result = cwlSourceSchema.safeParse({
      entrypoint: "main.cwl",
      documents: [{ name: "main.cwl", content: "x" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.parameters).toEqual([]);
    }
  });

  it("accepts nested relative document names", () => {
    const result = cwlSourceSchema.safeParse({
      ...validSource,
      documents: [{ name: "steps/tool.cwl", content: "x" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a payload with no documents", () => {
    const result = cwlSourceSchema.safeParse({ ...validSource, documents: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a missing entrypoint", () => {
    const { entrypoint: _omit, ...rest } = validSource;
    void _omit;
    const result = cwlSourceSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an empty document name", () => {
    const result = cwlSourceSchema.safeParse({
      ...validSource,
      documents: [{ name: "", content: "x" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a traversing document name", () => {
    const result = cwlSourceSchema.safeParse({
      ...validSource,
      documents: [{ name: "../evil.cwl", content: "x" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an absolute (posix) document name", () => {
    const result = cwlSourceSchema.safeParse({
      ...validSource,
      documents: [{ name: "/etc/passwd", content: "x" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a Windows-absolute document name", () => {
    const result = cwlSourceSchema.safeParse({
      ...validSource,
      documents: [{ name: "C:\\Windows\\evil", content: "x" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a traversing entrypoint", () => {
    const result = cwlSourceSchema.safeParse({
      ...validSource,
      entrypoint: "../../main.cwl",
    });
    expect(result.success).toBe(false);
  });
});
