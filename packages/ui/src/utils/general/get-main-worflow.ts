import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

/**
 * Returns the main workflow from a packed CWL document.
 * Looks for workflow with id "#main", "main", or class "Workflow".
 *
 * @param packedWorkflow CWL packed document
 * @returns The main Workflow, or undefined if not found
 */
export const getMainWorkflow = (
  packedWorkflow: CWLPackedDocument
): Workflow | undefined => {
  if (!packedWorkflow.$graph || packedWorkflow.$graph.length === 0) {
    return undefined;
  }

  return packedWorkflow.$graph.find(
    (item: Workflow) =>
      item.id === "#main" || item.id === "main" || item.class === "Workflow"
  );
};