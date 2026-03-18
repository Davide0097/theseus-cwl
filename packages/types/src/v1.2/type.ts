type PrimitiveType =
  | "string"
  | "boolean"
  | "int"
  | "long"
  | "float"
  | "double"
  | "null";

type ComplexType = "array" | "record";

type SpecialType = "File" | "Directory" | "Any";

type ArrayType<T extends string> = `${T}[]`;

type OptionalType<T extends string> = `${T}?`;

export type Type =
  | PrimitiveType
  | ComplexType
  | SpecialType
  | ArrayType<PrimitiveType | ComplexType | SpecialType>
  | OptionalType<PrimitiveType | ComplexType | SpecialType>;
