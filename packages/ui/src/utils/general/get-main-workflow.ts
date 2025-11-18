import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

/**
 * Returns the main workflow from a packed CWL document.
 * Looks for workflow with id "#main" or "main".
 *
 * @param {CWLPackedDocument} packedWorkflow CWL packed document
 * @returns The main Workflow, or undefined if not found
 */
export const getMainWorkflow = (
  packedWorkflow: CWLPackedDocument,
): Workflow | undefined => {
  return Object.values(packedWorkflow.$graph).find(
    (item: Workflow) =>
      item.id.trim().toLocaleLowerCase() === "#main" ||
      item.id.trim().toLocaleLowerCase() === "main",
  );
};
