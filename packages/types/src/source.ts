import { CWLPackedDocument, Process, Shape, Workflow } from "./v1.2";

export type CwlSourceDocumentContent<S extends Shape = Shape.Sanitized> =
  S extends Shape.Sanitized
    ?
        | Workflow<Shape.Sanitized>
        | CWLPackedDocument<Shape.Sanitized>
        | Process<Shape.Sanitized>
        | undefined
    : S extends Shape.Raw
      ?
          | Workflow<Shape.Raw>
          | CWLPackedDocument<Shape.Raw>
          | Process<Shape.Raw>
          | Workflow<Shape.Sanitized>
          | CWLPackedDocument<Shape.Sanitized>
          | Process<Shape.Sanitized>
          | string
          | File
          | undefined
      : never;

export type CwlSourceDocument<S extends Shape = Shape.Sanitized> = {
  name: string;
  content: CwlSourceDocumentContent<S>;
};

export type CwlSourceParameter = {
  name: string;
  content: string | File | undefined;
};

export type CwlSource<S extends Shape = Shape.Sanitized> = {
  entrypoint: string;
  documents: [CwlSourceDocument<S>];
  parameters: CwlSourceParameter[];
};
