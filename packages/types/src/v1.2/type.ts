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

type BaseType = PrimitiveType | ComplexType | SpecialType;

type ArrayType<T extends string> = `${T}[]`;

type OptionalType<T extends string> = `${T}?`;

export type Type =
  | BaseType
  | ArrayType<BaseType>
  | OptionalType<BaseType>
  | OptionalType<ArrayType<BaseType>>;
