import { Input } from "./input";
import { Output } from "./output";
import { CWLVersion } from "./version";

/**
 * The abstract base type for executable components such as CommandLineTool, ExpressionTool, and Workflow.
 * Process is not a standalone document type in CWL, it is used here to build other types.
 * 'A process is a basic unit of computation which accepts input data,
 * performs some computation, and produces output data.
 * Examples include CommandLineTools, Workflows, and ExpressionTools.'
 */
export type Process = {
  /**
   *  The type of process that the object is describing.
   */
  class?: string;

  /**
   * The unique identifier for this process object.
   */
  id?: string;

  /**
   * The inputs of a tool is a list of input parameters that control how to run the tool.
   * Each parameter has an id for the name of parameter, and type describing what types of values are valid for that parameter.
   */
  inputs?: Record<string, Input>;

  /**
   * The outputs of a tool is a list of output parameters that should be returned after running the tool.
   * Each parameter has an id for the name of parameter, and type describing what types of values are valid for that parameter.
   */
  outputs?: Record<string, Output>;

  /**
   * Declares requirements that apply to either the runtime environment or the
   * workflow engine that must be met in order to execute this process.
   */
  requirements?: string[];

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
