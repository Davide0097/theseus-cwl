import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

export const isPackedDocument = (
  object: CWLPackedDocument | Workflow,
): object is CWLPackedDocument => "$graph" in object;
