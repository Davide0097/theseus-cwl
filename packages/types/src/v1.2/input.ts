import { Type } from "./type";
import { Shape } from "./workflow";

export type ExtendedInput<S extends Shape = Shape.Sanitized> =
  (S extends Shape.Sanitized ? { id: string } : { id?: string }) & {
    type: Type | Type[];

    /**
     * A default value that can be overridden, e.g. --message "Hola mundo"
     */
    default?: string;

    /**
     * Bind this message value as an argument to "echo".
     */
    inputBinding?: {
      position: number;
    };

    doc?: string;
  };

export type Input<S extends Shape = Shape.Sanitized> = S extends Shape.Sanitized
  ? ExtendedInput<S>
  : Type | ExtendedInput<S>;
