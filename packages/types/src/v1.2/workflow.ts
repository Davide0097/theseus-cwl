import { Process } from "./process";
import { WorkflowOutput } from "./workflow-output";
import { WorkflowStep } from "./workflow-step";

export enum Shape {
  Sanitized = "sanitized",
  Raw = "raw",
}

/**
 * # Workflow
 *
 * "A workflow is a CWL processing unit that executes command-line tools, expression tools, or workflows (sub-workflows) as steps.
 * It must have inputs, outputs, and steps defined in the CWL document."
 *
 * The workflow is a process that contains steps.
 * Steps can be other workflows (nested workflows), command-line tools, or expression tools.
 * The inputs of a workflow can be passed to any of its steps, while the outputs produced by its steps can be used in the final output of the workflow.
 */

export type Workflow<S extends Shape = Shape.Sanitized> = Process<
  S,
  "Workflow"
> & {
  /**
   * The record of parameters representing the steps that make up the workflow.
   */
  steps?: Record<string, WorkflowStep<S>>;

  /**
   * The record of parameters representing the outputs that make up the workflow.
   */
  outputs: Record<string, WorkflowOutput<S>>;

  requirements?: (
    | { class: "ScatterFeatureRequirement" }
    | { class: "SubworkflowFeatureRequirement" }
  )[];
};
