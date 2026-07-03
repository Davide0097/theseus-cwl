import { Output } from "./output";
import { Shape } from "./workflow";

export type WorkflowOutput<S extends Shape = Shape.Sanitized> = Output &
  (S extends Shape.Sanitized ? { id: string } : { id?: string }) & {
    /**
     * Specifies one or more workflow parameters that supply the value of to the output parameter.
     */
    outputSource?: string | string[];
  };
