import { Process } from "./process";
import { Shape } from "./workflow";
import { WorkflowOutput } from "./workflow-output";
import { WorkflowStep } from "./workflow-step";

/**
 * # Command-line tool
 *
 * A command-line tool is a wrapper for a command-line utility like echo, ls, and tar.
 * A command-line tool can be called from a workflow.
 */
export type CommandlineTool<S extends Shape = Shape.Sanitized> = Process<
  S,
  "CommandlineTool"
> & {
  /**
   * The record of parameters representing the steps that make up the workflow.
   */
  steps?: Record<string, WorkflowStep<S>>;

  /**
   * The record of parameters representing the outputs that make up the workflow.
   */
  outputs: Record<string, WorkflowOutput<S>>;
};
