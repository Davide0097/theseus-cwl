export type PrimitiveType =
  | "string"
  | "boolean"
  | "int"
  | "long"
  | "float"
  | "double"
  | "null";

export type ComplexType = "array" | "record";

export type SpecialType = "File" | "Directory" | "Any";

export type ArrayType<T extends string> = `${T}[]`;

export type Type =
  | PrimitiveType
  | ComplexType
  | SpecialType
  | ArrayType<PrimitiveType | ComplexType | SpecialType>;
