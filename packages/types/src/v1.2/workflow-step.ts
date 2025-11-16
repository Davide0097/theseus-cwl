import { Process } from "./process";

/**
 * 'Expression' is not a real type.  It indicates that a field must allow
 * runtime parameter references.  If [InlineJavascriptRequirement](#InlineJavascriptRequirement)
 * is declared and supported by the platform, the field must also allow Javascript expressions.
 */
export type Expression = "ExpressionPlaceholder";

/**
 * The input of a workflow step connects an upstream parameter (from the
 * workflow inputs, or the outputs of other workflows steps) with the input
 * parameters of the underlying step.
 *
 * ## Input object
 *
 * A WorkflowStepInput object must contain an `id` field in the form
 * `#fieldname` or `#stepname.fieldname`.  When the `id` field contains a
 * period `.` the field name consists of the characters following the final
 * period.  This defines a field of the workflow step input object with the
 * value of the `source` parameter(s).
 *
 * ## Merging
 *
 * To merge multiple inbound data links,
 * [MultipleInputFeatureRequirement](#MultipleInputFeatureRequirement) must be specified
 * in the workflow or workflow step requirements.
 *
 * If the sink parameter is an array, or named in a [workflow
 * scatter](#WorkflowStep) operation, there may be multiple inbound data links
 * listed in the `source` field.  The values from the input links are merged
 * depending on the method specified in the `linkMerge` field.  If not
 * specified, the default method is "merge_nested".
 *
 * * **merge_nested**
 *
 *   The input must be an array consisting of exactly one entry for each
 *   input link.  If "merge_nested" is specified with a single link, the value
 *   from the link must be wrapped in a single-item list.
 *
 * * **merge_flattened**
 *
 *   1. The source and sink parameters must be compatible types, or the source
 *      type must be compatible with single element from the "items" type of
 *      the destination array parameter.
 *   2. Source parameters which are arrays are concatenated.
 *      Source parameters which are single element types are appended as
 *      single elements.
 */
export type WorkflowStepInput = {
  /**
   * The default value for this parameter if there is no `source`
   * field.
   *
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
   *
   */
  valueFrom?: string | Expression;

  /**
   * Specifies one or more workflow parameters that will provide input to
   * the underlying step parameter.
   *
   */
  source?: string | string[];

  /**
   * The method to use to merge multiple inbound links into a single array.
   * If not specified, the default method is "merge_nested".
   *
   */
  linkMerge?: "merge_nested" | "merge_flattened";
};

/**
 * Associate an output parameter of the underlying process with a workflow
 * parameter.  
 * The workflow parameter (given in the `id` field) be may be used
 * as a `source` to connect with input parameters of other workflow steps, or
 * with an output parameter of the process.
 */
export type WorkflowStepOutput = {
  /**
   * A unique identifier for this workflow output parameter.  This is the
   * identifier to use in the `source` field of `WorkflowStepInput` to
   * connect the output value to downstream parameters.
   */
  id: string;
};

/**
 * A workflow step is an executable element of a workflow.
 * It specifies the underlying process implementation (such as `CommandLineTool` or another
 * `Workflow`) in the `run` field and connects the input and output parameters
 * of the underlying process to workflow parameters.
 *
 * # Scatter/gather
 *
 * To use scatter/gather,
 * [ScatterFeatureRequirement](#ScatterFeatureRequirement) must be specified
 * in the workflow or workflow step requirements.
 *
 * A "scatter" operation specifies that the associated workflow step or
 * subworkflow should execute separately over a list of input elements.  Each
 * job making up a scatter operation is independent and may be executed
 * concurrently.
 *
 * The `scatter` field specifies one or more input parameters which will be
 * scattered.  An input parameter may be listed more than once.  The declared
 * type of each input parameter is implicitly wrapped in an array for each
 * time it appears in the `scatter` field.  As a result, upstream parameters
 * which are connected to scattered parameters may be arrays.
 *
 * All output parameter types are also implicitly wrapped in arrays.  Each job
 * in the scatter results in an entry in the output array.
 *
 * If `scatter` declares more than one input parameter, `scatterMethod`
 * describes how to decompose the input into a discrete set of jobs.
 *
 *   * **dotproduct** specifies that each of the input arrays are aligned and one
 *       element taken from each array to construct each job.  It is an error
 *       if all input arrays are not the same length.
 *
 *   * **nested_crossproduct** specifies the Cartesian product of the inputs,
 *       producing a job for every combination of the scattered inputs.  The
 *       output must be nested arrays for each level of scattering, in the
 *       order that the input arrays are listed in the `scatter` field.
 *
 *   * **flat_crossproduct** specifies the Cartesian product of the inputs,
 *       producing a job for every combination of the scattered inputs.  The
 *       output arrays must be flattened to a single level, but otherwise listed in the
 *       order that the input arrays are listed in the `scatter` field.
 *
 * # Subworkflows
 *
 * To specify a nested workflow as part of a workflow step,
 * [SubworkflowFeatureRequirement](#SubworkflowFeatureRequirement) must be
 * specified in the workflow or workflow step requirements.
 *
 */
export type WorkflowStep = {
  /**
   * Defines the input parameters of the workflow step.  The process is ready to
   * run when all required input parameters are associated with concrete
   * values.
   */
  in: Record<string, WorkflowStepInput | string>;

  /**
   * Defines the parameters representing the output of the process.
   * May be used to generate and/or validate the output object.
   */
  out: string | Array<string | WorkflowStepOutput>;

  /**
   * Declares requirements that apply to either the runtime environment or the
   * workflow engine that must be met in order to execute this workflow step.  If
   * an implementation cannot satisfy all requirements, or a requirement is
   * listed which is not recognized by the implementation, it is a fatal
   * error and the implementation must not attempt to run the process,
   * unless overridden at user option.
   */
  requirements?: {
    class: string;
  }[];

  /**
   * Declares hints applying to either the runtime environment or the
   * workflow engine that may be helpful in executing this workflow step.  It is
   * not an error if an implementation cannot satisfy all hints, however
   * the implementation may report a warning.
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
   * Specifies the process to run.
   */
  run: string | Process;

  scatter?: string | string[];

  /**
   * Required if `scatter` is an array of more than one element.
   */
  scatterMethod?: "dotproduct" | "nested_crossproduct" | "flat_crossproduct";
};
