import { isWorkflow } from "@theseus-cwl/parser";
import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";

import { stripFragment } from "./strip-fragment";

/**
 * Returns the main workflow from a packed CWL document.
 *
 * Resolution order (fragment `#` prefixes are ignored when comparing ids):
 * 1. The workflow whose id matches the document's `entryPoint`, or is named
 *    `main` (the packed-document convention).
 * 2. The graph root: the only workflow that no step of another workflow
 *    references through `run`. This covers documents whose entry workflow has
 *    a custom id while `main` names a tool (or does not exist at all).
 *
 * @param {CWLPackedDocument} packedDocument CWL packed document
 *
 * @returns The main Workflow, or undefined if none can be determined
 */
export const getMainWorkflow = (
  packedDocument: CWLPackedDocument,
): Workflow | undefined => {
  const graph = Object.values(packedDocument.$graph) || [];
  const workflows = graph.filter((process): process is Workflow =>
    isWorkflow(process),
  );

  const byEntryPoint = workflows.find(
    (workflow) =>
      workflow.id === packedDocument.entryPoint ||
      stripFragment(workflow.id ?? "")
        .trim()
        .toLowerCase() === "main",
  );

  if (byEntryPoint) {
    return byEntryPoint;
  }

  const referencedIds = new Set(
    workflows
      .flatMap((workflow) => Object.values(workflow.steps ?? {}))
      .map((step) =>
        typeof step.run === "string" ? stripFragment(step.run) : undefined,
      )
      .filter((run): run is string => run !== undefined),
  );

  const roots = workflows.filter(
    (workflow) => !referencedIds.has(stripFragment(workflow.id ?? "")),
  );

  return roots.length === 1 ? roots[0] : undefined;
};
