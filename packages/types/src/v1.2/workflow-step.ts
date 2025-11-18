import { Process } from "./process";
import { Shape } from "./workflow";

/**
 * 'Expression' is not a real type. It indicates that a field must allow
 * runtime parameter references. If [InlineJavascriptRequirement](#InlineJavascriptRequirement)
 * is declared and supported by the platform, the field must also allow Javascript expressions.
 */
export type Expression = "ExpressionPlaceholder";

/**
 * The input of a workflow step connects an upstream parameter (from the
 * workflow inputs, or the outputs of other workflows steps) with the input
 * parameters of the underlying step.
 */
export type WorkflowStepInput = {
  /**
   * The default value for this parameter if there is no `source` field.
   */
  default?: any;

  /**
   * To use valueFrom, [StepInputExpressionRequirement](#StepInputExpressionRequirement) must
   * be specified in the workflow or workflow step requirements.
   *
   * If `valueFrom` is a constant string value, use this as the value for
   * this input parameter.
   *
   * If `valueFrom` is a parameter reference or expression, it must be
   * evaluated to yield the actual value to be assiged to the input field.
   *
   * The `self` value of in the parameter reference or expression must be
   * the value of the parameter(s) specified in the `source` field, or
   * null if there is no `source` field.
   *
   * The value of `inputs` in the parameter reference or expression must be
   * the input object to the workflow step after assigning the `source`
   * values and then scattering.  The order of evaluating `valueFrom` among
   * step input parameters is undefined and the result of evaluating
   * `valueFrom` on a parameter must not be visible to evaluation of
   * `valueFrom` on other parameters.
   */
  valueFrom?: string | Expression;

  /**
   * Specifies one or more workflow parameters that will provide input to
   * the underlying step parameter.
   */
  source?: string | string[];

  /**
   * The method to use to merge multiple inbound links into a single array.
   * If not specified, the default method is "merge_nested".
   */
  linkMerge?: "merge_nested" | "merge_flattened";
};

/**
 * Associate an output parameter of the underlying process with a workflow parameter.
 * The workflow parameter (given in the `id` field) be may be used
 * as a `source` to connect with input parameters of other workflow steps, or
 * with an output parameter of the process.
 */
export type WorkflowStepOutput = {
  /**
   * A unique identifier for this workflow output parameter.
   * This is the identifier to use in the `source` field of `WorkflowStepInput` to
   * connect the output value to downstream parameters.
   */
  id: string;
};

/**
 * # Worflow step
 *
 * A workflow step is an executable element of a workflow.
 * It specifies the underlying process implementation (such as `CommandLineTool` or another
 * `Workflow`) in the `run` field and connects the input and output parameters
 * of the underlying process to workflow parameters.
 */
export type WorkflowStep<S extends Shape = Shape.Sanitized> =
  (S extends Shape.Sanitized ? { id: string } : {}) & {
    /**
     * Defines the input parameters of the workflow step.
     */
    in: S extends Shape.Sanitized
      ? Record<string, WorkflowStepInput>
      : Record<string, WorkflowStepInput | string>;

    /**
     * Defines the parameters representing the output of the process.
     */
    out: string | Array<string | WorkflowStepOutput>;

    /**
     * Specifies the process to run.
     */
    run: string | Process<S>;

    /**
     * Declares requirements that apply to either the runtime environment or the
     * workflow engine that must be met in order to execute this workflow step.
     */
    requirements?: {
      class: string;
    }[];

    /**
     * Declares hints applying to either the runtime environment or the
     * workflow engine that may be helpful in executing this workflow step.
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

    scatter?: string | string[];

    /**
     * Required if `scatter` is an array of more than one element.
     */
    scatterMethod?: "dotproduct" | "nested_crossproduct" | "flat_crossproduct";
  };
