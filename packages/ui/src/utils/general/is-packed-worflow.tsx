import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

export const isPackedWorkflow = (
  object: CWLPackedDocument | Workflow
): object is CWLPackedDocument => {
  return (
    typeof object === "object" &&
    object !== null &&
    "$graph" in object &&
    Array.isArray((object as CWLPackedDocument).$graph)
  );
}; 