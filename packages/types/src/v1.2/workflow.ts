import { Process } from "./process";
import { WorkflowOutput } from "./workflow-output";
import { WorkflowStep } from "./workflow-step";

/**
 * A workflow describes a set of **steps** and the **dependencies** between
 * those steps.
 * When a step produces output that will be consumed by a
 * second step, the first step is a dependency of the second step.
 *
 * # Extensions
 *
 * [ScatterFeatureRequirement](#ScatterFeatureRequirement) and
 * [SubworkflowFeatureRequirement](#SubworkflowFeatureRequirement) are
 * available as standard [extensions](#Extensions_and_Metadata) to core
 * workflow semantics.
 *
 */
export type Workflow = Process & {
  class: string;

  /**
   * The individual steps that make up the workflow.
   */
  steps?: Record<string, WorkflowStep>;

  /**
   * Defines the parameters representing the output of the process.  May be
   * used to generate and/or validate the output object.
   */
  outputs: Record<string, WorkflowOutput>;
};

