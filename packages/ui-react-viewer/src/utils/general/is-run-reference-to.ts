import { WorkflowStep } from "@theseus-cwl/types";

import { stripFragment } from "./strip-fragment";

/**
 * Checks whether a step's `run` value is a string reference to the process
 * with the given id (fragment `#` prefixes are ignored on both sides).
 * Inline (embedded) `run` processes never match.
 *
 * Node layout and edge initialization share this predicate so that edges are
 * only built for `$graph` entries whose nodes are actually laid out.
 *
 * @param {WorkflowStep["run"] | undefined} run a step's `run` value
 * @param {string | undefined} processId the id of a `$graph` process
 *
 * @returns {boolean} whether `run` references the process
 */
export const isRunReferenceTo = (
  run: WorkflowStep["run"] | undefined,
  processId: string | undefined,
): boolean =>
  typeof run === "string" &&
  stripFragment(run) === stripFragment(processId ?? "");
