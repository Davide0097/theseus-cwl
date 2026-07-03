import { Type } from "./type";
import { Shape } from "./workflow";
import { Expression } from "./workflow-step";

export type ExtendedInput<S extends Shape = Shape.Sanitized> =
  (S extends Shape.Sanitized ? { id: string } : { id?: string }) & {
    type: Type | Type[];

    /**
     * A default value used if the parameter is not supplied. May be any value
     * (e.g. a string, number, boolean, or a File/Directory object).
     */
    default?: any;

    /**
     * How to turn this input into a command-line argument. `position` defaults
     * to 0 when omitted.
     */
    inputBinding?: {
      position?: number;
      prefix?: string;
      separate?: boolean;
      itemSeparator?: string;
      valueFrom?: string | Expression;
      shellQuote?: boolean;
    };

    label?: string;

    doc?: string;
  };

export type Input<S extends Shape = Shape.Sanitized> = S extends Shape.Sanitized
  ? ExtendedInput<Shape.Sanitized>
  : Type | ExtendedInput<Shape.Raw> | ExtendedInput<Shape.Sanitized>;
