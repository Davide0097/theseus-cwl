import {
  CWLPackedDocument,
  CwlSourceDocumentContent,
  Process,
  Shape,
  Workflow,
} from "@theseus-cwl/types";

/**
 * Type guard for packed (`$graph`) CWL documents.
 *
 * @param {CwlSourceDocumentContent<Shape.Raw>} object
 *
 * @returns {object is CWLPackedDocument<Shape.Raw>}
 */
export const isPackedDocument = (
  object: CwlSourceDocumentContent<Shape.Raw>,
): object is CWLPackedDocument<Shape.Raw> => {
  return typeof object === "object" && object !== null && "$graph" in object;
};

/**
 * Type guard distinguishing a `Workflow` from any other process.
 *
 * @param {Workflow<Shape.Raw> | Process<Shape.Raw>} object
 *
 * @returns {object is Workflow<Shape.Raw>}
 */
export const isWorkflow = (
  object: Workflow<Shape.Raw> | Process<Shape.Raw>,
): object is Workflow<Shape.Raw> => {
  return object.class === "Workflow";
};
