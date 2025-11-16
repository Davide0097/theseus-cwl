import {  Input, Type } from "@theseus-cwl/types";

export const normalizeInput = (
  input: Input
):  {
    type: Type | Type[];
    default?: string;
    inputBinding?: {
        position: number;
    };
} => {
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
