import { isWorkflow } from "@theseus-cwl/parser";
import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

/**
 * Returns the main workflow from a packed CWL document.
 * Looks for workflow with id "#main" or "main".
 *
 * @param {CWLPackedDocument} packedWorkflow CWL packed document
 * 
 * @returns The main Workflow, or undefined if not found
 */
export const getMainWorkflow = (
  packedDocument: CWLPackedDocument,
): Workflow | undefined => {
  const graph = Object.values(packedDocument.$graph) || [];

  const byEntryPoint = graph.find(
    (item) =>
      item.id === packedDocument.entryPoint ||
      item.id?.trim().toLowerCase() === "#main" ||
      item.id?.trim().toLowerCase() === "main",
  );

  if (byEntryPoint && isWorkflow(byEntryPoint)) {
    return byEntryPoint;
  } else {
    return undefined;
  }
};
