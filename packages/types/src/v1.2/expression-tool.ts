import { Output } from "./output";
import { Process } from "./process";
import { Shape } from "./workflow";
import { Expression } from "./workflow-step";

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
  /**
   * The expression to execute. The expression must return a JSON object which
   * matches the output parameters of the expression tool.
   */
  expression: string | Expression;

  /**
   * The output parameters of the expression tool.
   */
  outputs: Record<string, Output>;
};
