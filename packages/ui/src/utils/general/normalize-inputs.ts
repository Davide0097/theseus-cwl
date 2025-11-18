import { Input, Shape, Type } from "@theseus-cwl/types";

export const normalizeInput = (
  input: Input<Shape.Raw | Shape.Raw>,
): Input<Shape.Sanitized> => {
  let normalized;

  if (typeof input === "string") {
    normalized = {
      id: input,
      type: "string" as Type,
    };
  } else {
    normalized = input as unknown as Input<Shape.Sanitized>;
  }

  return normalized;
};
