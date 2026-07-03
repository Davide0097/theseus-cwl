import {
  CwlSourceDocumentContent,
  Process,
  Shape,
  Workflow,
  WorkflowStep,
} from "@theseus-cwl/types";

export const assertAndGetDocumentName = (name: string): string => {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Document `name` must be a non-empty string");
  }

  return name;
};

export const assertAndGetDocumentFormat = (name: string): "json" | "yaml" => {
  let format: "yaml" | "json" | undefined = undefined;
  const lowerCaseName = name.toLowerCase();

  if (lowerCaseName.endsWith(".json")) {
    format = "json";
  } else if (
    lowerCaseName.endsWith(".cwl") ||
    lowerCaseName.endsWith(".yaml") ||
    lowerCaseName.endsWith(".yml")
  ) {
    format = "yaml";
  }

  if (!format) {
    throw new Error(
      `Document named ${name} has an unsupported format, allowed extensions are .json, .yaml, .yml and .cwl`,
    );
  }

  return format;
};

export const assertAndGetDocumentContent = (
  content: CwlSourceDocumentContent<Shape.Raw>,
) => {
  if (!content) {
    throw new Error("Document is missing the content");
  }

  return content;
};

export const assertAndGetParameterName = (name: string): string => {
  if (typeof name !== "string" || !name.trim()) {
    throw new Error("Parameter `name` must be a non-empty string");
  }

  return name;
};

export const assertAndGetParameterFormat = (
  name: string,
): "json" | "yaml" | "txt" => {
  let format: "yaml" | "json" | "txt" | undefined = undefined;
  const lowerCaseName = name.toLowerCase();

  if (lowerCaseName.endsWith(".json")) {
    format = "json";
  } else if (
    lowerCaseName.endsWith(".cwl") ||
    lowerCaseName.endsWith(".yaml") ||
    lowerCaseName.endsWith(".yml")
  ) {
    format = "yaml";
  } else if (lowerCaseName.endsWith(".txt")) {
    format = "txt";
  }

  if (!format) {
    throw new Error(
      `Parameter item named ${name} has an unsupported format, allowed extensions are .json, .yaml, .yml, .cwl and .txt`,
    );
  }

  return format;
};

export const assertAndGetParameterContent = (
  content: string | File | undefined,
) => {
  if (!content) {
    throw new Error("Parameter item is missing the content");
  }

  return content;
};

const PROCESS_CLASSES = [
  "Workflow",
  "CommandLineTool",
  "ExpressionTool",
  "Operation",
];

export const assertAndGetProcessClass = (cls: string) => {
  if (!cls || typeof cls !== "string" || cls.trim() === "") {
    throw new Error("A CWL process is missing the required `class` field");
  }

  if (!(PROCESS_CLASSES as readonly string[]).includes(cls)) {
    throw new Error(
      `A CWL process has an unknown 'class' field "${cls}", expected one of ${PROCESS_CLASSES.join(", ")}`,
    );
  }

  return cls as (typeof PROCESS_CLASSES)[number];
};

export const assertAndGetStepRun = (
  run: WorkflowStep<Shape.Raw>["run"] | undefined,
): string | Process<Shape.Raw> => {
  if (!run) {
    throw new Error("A workflow step is missing the required `run` field");
  }

  if (
    typeof run !== "string" &&
    (typeof run !== "object" || Array.isArray(run))
  ) {
    throw new Error(
      "A workflow step has an invalid `run` field: expected a string reference or an inline process",
    );
  }

  return run;
};

export const buildFallbackId = (
  object: Workflow<Shape.Raw> | Process<Shape.Raw>,
) => {
  const signature = JSON.stringify([
    object.class,
    object.label ?? null,
    object.inputs ? Object.keys(object.inputs).sort() : [],
    object.outputs ? Object.keys(object.outputs).sort() : [],
  ]);

  let hash = 0;
  for (let i = 0; i < signature.length; i++) {
    hash = (hash * 31 + signature.charCodeAt(i)) | 0;
  }

  return `${object.class.toLowerCase()}_${(hash >>> 0).toString(36)}`;
};
