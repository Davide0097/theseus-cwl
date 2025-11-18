import { CWLPackedDocument, Shape, Workflow } from "@theseus-cwl/types";

export const isPackedDocument = <T extends Shape>(
  object: CWLPackedDocument<T> | Workflow<T>,
): object is CWLPackedDocument<T> => {
  return typeof object === "object" && object !== null && "$graph" in object;
};
