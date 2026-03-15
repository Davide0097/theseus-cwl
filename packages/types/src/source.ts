import { CWLPackedDocument, Shape, Workflow } from "./v1.2";

export type CwlSourceDocumentContent<S extends Shape = Shape.Sanitized> =
  S extends Shape.Sanitized
    ? Workflow<Shape.Sanitized> | CWLPackedDocument<Shape.Sanitized> | undefined
    : S extends Shape.Raw
      ?
          | string
          | File
          | undefined
          | Workflow<Shape.Raw>
          | CWLPackedDocument<Shape.Raw>
          | Workflow<Shape.Sanitized>
          | CWLPackedDocument<Shape.Sanitized>
      : never;

export type CwlSourceDocument<S extends Shape = Shape.Sanitized> = {
  name: string;
  content: CwlSourceDocumentContent<S>;
};

export type CwlSourceParameter<S extends Shape = Shape.Sanitized> = {
  name: string;
  content: string | File | undefined;
};

export type CwlSource<S extends Shape = Shape.Sanitized> = {
  entrypoint: string;
  documents: [CwlSourceDocument<S>];
  parameters: CwlSourceParameter<S>[];
};
