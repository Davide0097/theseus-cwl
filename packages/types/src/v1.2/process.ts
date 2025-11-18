import { Input } from "./input";
import { Output } from "./output";
import { CWLVersion } from "./version";
import { Shape } from "./workflow";

/**
 * # Process
 *
 * A process is a computing unit that takes inputs and produces outputs.
 * The behavior of a process can be affected by the inputs, requirements, and hints.
 *
 * There are four types of processes defined in the CWL specification v1.2:
 *
 * - A command-line tool.
 * - An expression tool.
 * - An operation.
 * - A workflow.
 */
export type Process<
  S extends Shape = Shape.Sanitized,
  T extends
    | "Workflow"
    | "ExpressionTool"
    | "CommandlineTool"
    | "Operation" = "Workflow",
> = (S extends Shape.Sanitized ? { id: string } : { id?: string }) & {
  /**
   *  The type of process that the object is describing.
   */
  class?: T;

  /**
   * The inputs of a tool is a list of input parameters that control how to run the tool.
   * Each parameter has an id for the name of parameter, and type describing what types of values are valid for that parameter.
   */
  inputs?: Record<string, Input<S>>;

  /**
   * The outputs of a tool is a list of output parameters that should be returned after running the tool.
   * Each parameter has an id for the name of parameter, and type describing what types of values are valid for that parameter.
   */
  outputs?: Record<string, Output>;

  /**
   * Declares requirements that apply to either the runtime environment or the
   * workflow engine that must be met in order to execute this process.
   */
  requirements?: any[];

  /**
   * Declares hints applying to either the runtime environment or the
   * workflow engine that may be helpful in executing this process.
   */
  hints?: any[];

  /**
   * A short, human-readable label of this process object.
   */
  label?: string;

  /**
   * A long, human-readable description of this process object.
   */
  doc?: string;

  /**
   * CWL document version. Always required at the document root. Not
   * required for a Process embedded inside another Process.
   *
   */
  cwlVersion?: CWLVersion;
};
