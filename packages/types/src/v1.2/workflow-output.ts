import { Output } from "./output";
import { Type } from "./type";

export type WorkflowOutput = Output & {
  /**
   * Specifies one or more workflow parameters that supply the value of to
   * the output parameter.
   */
  outputSource?: string | string[];

  /**
   * The method to use to merge multiple sources into a single array.
   * If not specified, the default method is "merge_nested".
   */
  linkMerge?: "merge_nested" | "merge_flattened";

  /**
   * Specify valid types of data that may be assigned to this parameter.
   */
  type?: Type;
};
