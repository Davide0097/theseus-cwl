import {
  CWLPackedDocument,
  Process,
  Shape,
  Workflow,
} from "@theseus-cwl/types";

/**
 * Type guard for packed (`$graph`) CWL documents.
 *
 * A packed document bundles multiple processes under a top-level `$graph`
 * field instead of describing a single process at the root.
 *
 * @param object - a raw CWL document (packed, workflow, or process).
 */
export const isPackedDocument = (
  object:
    | CWLPackedDocument<Shape.Raw>
    | Workflow<Shape.Raw>
    | Process<Shape.Raw>,
): object is CWLPackedDocument<Shape.Raw> => {
  return typeof object === "object" && object !== null && "$graph" in object;
};

/**
 * Type guard distinguishing a `Workflow` from any other process.
 *
 * @param object - a raw workflow or process.
 */
export const isWorkflow = (
  object: Workflow<Shape.Raw> | Process<Shape.Raw>,
): object is Workflow<Shape.Raw> => {
  return object.class === "Workflow";
};
