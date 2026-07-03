import { Output } from "./output";
import { Process } from "./process";
import { Shape } from "./workflow";

/**
 * # Command-line tool
 *
 * A command-line tool is a wrapper for a command-line utility like echo, ls, and tar.
 * A command-line tool can be called from a workflow.
 */
export type CommandlineTool<S extends Shape = Shape.Sanitized> = Process<
  S,
  "CommandLineTool"
> & {
  /**
   * The output parameters of the tool.
   */
  outputs: Record<string, Output>;
};
