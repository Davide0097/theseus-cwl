import { Type } from "./type";

export type Input =
  | string
  | {
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
    };
