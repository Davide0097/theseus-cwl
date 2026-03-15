import { Process } from "./process";
import { CWLVersion } from "./version";
import { Shape, Workflow } from "./workflow";

/**
 * # Packed document
 *
 * A "packed" CWL document is one that contains multiple process objects.
 * This makes it possible to store and transmit a Workflow together with the processes of each of its steps in a single file.
 *
 * There are two methods to create packed documents: embedding and $graph. These can be both appear in the same document.
 *
 * "Embedding" is where the entire process object is copied into the run field of a workflow step.
 * If the step process is a subworkflow, it can be processed recursively to embed the processes of the subworkflow steps, and so on.
 * Embedded process objects may optionally include id fields.
 *
 * A "$graph" document does not have a process object at the root.
 * Instead, there is a $graph field which consists of a list of process objects. Each process object must have an id field.
 * Workflow run fields cross-reference other processes in the document $graph using the id of the process object.
 */
export type CWLPackedDocument<S extends Shape = Shape.Sanitized> = Process<
  S,
  "Workflow"
> & {
  cwlVersion: CWLVersion;
  $graph: Record<string, Workflow<S>>;
};
