export type CWLFileVersion = "v1.2";

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

export type HasKey = {
  __key?: string;
};

export type Type =
  | PrimitiveType
  | ComplexType
  | SpecialType
  | ArrayType<PrimitiveType | ComplexType | SpecialType>;

export type Input =
  | string
  | ({
      type: Type | Type[];

      /**
       * A default value that can be overridden, e.g. --message "Hola mundo"
       */
      default?: string;

      /**
       * Bind this message value as an argument to "echo".
       */
      inputBinding?: {
        position: number;
      };
    } & HasKey);

/** The CWL file inputs */
export type Inputs = Record<string, Input>;

/** The CWL file step */
export type Step = {
  run: string;
  in:
    | Record<string, string>
    | Record<string, { source: string | string[]; default?: boolean }>;
  out: string | [string];
  scatter?: string;
} & HasKey;

/** The CWL file steps */
export type Steps = Record<string, Step>;

/** The CWL file output */
export type Output = {
  type: PrimitiveType | ComplexType | SpecialType;
  outputSource?: string;
} & HasKey;

/** The CWL file outputs */
export type Outputs = Record<string, Output>;

/**
 * The main CWL file json object
 */
export interface CWLObject {
  cwlVersion: CWLFileVersion;

  /** What type of CWL process we have in this document. */
  class: "CommandLineTool" | "Workflow";

  /** This CommandLineTool executes the linux "echo" command-line tool. */
  baseCommand?: string;

  /**
   * The inputs of a tool is a list of input parameters that control how to run the tool.
   * Each parameter has an id for the name of parameter, and type describing what types of values are valid for that parameter.
   */
  inputs: Inputs;

  /**
   *
   */
  steps: Steps;

  /**
   * The outputs of a tool is a list of output parameters that should be returned after running the tool.
   * Each parameter has an id for the name of parameter, and type describing what types of values are valid for that parameter.
   */
  outputs: Outputs;
}
