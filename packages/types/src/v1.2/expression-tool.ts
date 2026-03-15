import { Process } from "./process";
import { Shape } from "./workflow";
import { WorkflowOutput } from "./workflow-output";
import { WorkflowStep } from "./workflow-step";

/**
 * # Expression tool
 *
 * An expression tool is a wrapper for a JavaScript expression.
 * It can be used to simplify workflows and command-line tools, moving common parts of a workflow execution into
 * reusable JavaScript code that takes inputs and produces outputs like a command-line tool.
 */
export type ExpressionTool<S extends Shape = Shape.Sanitized> = Process<
  S,
  "ExpressionTool"
> & {
  expression: any;

  /**
   * The record of parameters representing the steps that make up the workflow.
   */
  steps?: Record<string, WorkflowStep<S>>;

  /**
   * The record of parameters representing the outputs that make up the workflow.
   */
  outputs: Record<string, WorkflowOutput<S>>;
};
