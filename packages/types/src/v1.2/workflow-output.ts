import { Output } from "./output";
import { Type } from "./type";
import { Shape } from "./workflow";

export type WorkflowOutput<S extends Shape = Shape.Sanitized> =
  (S extends Shape.Sanitized ? { id: string } : {}) &
    Output & {
      /**
       * Specifies one or more workflow parameters that supply the value of to
       * the output parameter.
       */
      outputSource?: string | string[];

      /**
       * Specify valid types of data that may be assigned to this parameter.
       */
      type?: Type;
    };
