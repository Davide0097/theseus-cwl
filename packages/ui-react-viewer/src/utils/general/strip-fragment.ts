/**
 * Strips the leading `#` from a CWL fragment reference.
 *
 * In packed documents a step's `run` refers to a `$graph` entry by fragment
 * identifier (`run: "#main"`), while the entry's own `id` is stored without
 * the `#` (`id: main`). Normalizing both sides with this helper makes them
 * comparable.
 *
 * @param {string} reference a process id or a `run` fragment reference
 *
 * @returns {string} the reference without its leading `#`
 */
export const stripFragment = (reference: string): string =>
  reference.startsWith("#") ? reference.slice(1) : reference;
