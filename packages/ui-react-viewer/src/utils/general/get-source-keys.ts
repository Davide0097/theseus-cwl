/**
 * Normalizes a CWL `source`/`outputSource` value (a single reference or an
 * array of references) into the ids it points at: the segment before the
 * first `/` of each entry (`"step/out"` → `"step"`, `"input1"` → `"input1"`).
 *
 * @param {string | string[] | undefined} source a step input `source` or a workflow output `outputSource`
 *
 * @returns {string[]} the referenced ids, in order
 */
export const getSourceKeys = (source?: string | string[]): string[] =>
  (Array.isArray(source) ? source : source ? [source] : [])
    .map((entry) => entry.split("/")[0])
    .filter((key): key is string => !!key);
