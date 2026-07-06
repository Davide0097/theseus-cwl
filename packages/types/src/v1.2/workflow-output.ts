import { Output } from "./output";
import { Shape } from "./workflow";

export type WorkflowOutput<S extends Shape = Shape.Sanitized> = Output &
  (S extends Shape.Sanitized ? { id: string } : { id?: string }) & {
    /**
     * Specifies one or more workflow parameters that supply the value of to the output parameter.
     */
    outputSource?: string | string[];

    /**
     * The method to use to merge multiple sources into a single value.
     */
    linkMerge?: "merge_nested" | "merge_flattened";

    /**
     * The method to use to pick non-null values among the outputs of `outputSource`.
     */
    pickValue?: "first_non_null" | "the_only_non_null" | "all_non_null";
  };
