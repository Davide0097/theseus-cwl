import { DefaultInput, Input, Type } from "@theseus-cwl/types";

export const normalizeInput = (
  input: Input
): DefaultInput => {
  let normalized;

  if (typeof input === "string") {
    normalized = {
      type: "string" as Type,
    };
  } else {
    normalized = input;
  }

  return normalized;
};
