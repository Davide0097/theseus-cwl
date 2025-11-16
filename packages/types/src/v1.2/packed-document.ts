import { Process } from "./process";
import { CWLVersion } from "./version";
import { Workflow } from "./workflow";

/**
 * A packed CWL document can be:
 *  - a single Process, or
 *  - a $graph document containing multiple Processes
 */
export type CWLPackedDocument = Process & {
  cwlVersion: CWLVersion;
  class: string;
  $graph: Workflow[];
};
