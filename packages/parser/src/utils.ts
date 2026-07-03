import {
  CwlSourceDocumentContent,
  Process,
  Shape,
  Workflow,
  WorkflowStep,
} from "@theseus-cwl/types";

const assertNonEmptyString = (value: string, label: string): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string`);
  }

  return value;
};

const assertPresent = <T>(value: T, message: string): NonNullable<T> => {
  if (!value) {
    throw new Error(message);
  }

  return value;
};

const EXTENSION_FORMATS = {
  ".json": "json",
  ".cwl": "yaml",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".txt": "txt",
} as const;

type Extension = keyof typeof EXTENSION_FORMATS;

const assertAndGetFormat = <E extends Extension>(
  name: string,
  label: string,
  allowed: readonly E[],
): (typeof EXTENSION_FORMATS)[E] => {
  const dot = name.lastIndexOf(".");
  const extension = dot === -1 ? "" : name.slice(dot).toLowerCase();
  const match = allowed.find(
    (allowedExtension) => allowedExtension === extension,
  );

  if (!match) {
    throw new Error(
      `${label} named ${name} has an unsupported format, allowed extensions are ${allowed.join(", ")}`,
    );
  }

  return EXTENSION_FORMATS[match];
};

export const assertAndGetDocumentName = (name: string): string =>
  assertNonEmptyString(name, "Document `name`");

export const assertAndGetDocumentFormat = (name: string) =>
  assertAndGetFormat(name, "Document", [
    ".json",
    ".cwl",
    ".yaml",
    ".yml",
  ] as const);

export const assertAndGetDocumentContent = (
  content: CwlSourceDocumentContent<Shape.Raw>,
) => assertPresent(content, "Document is missing the content");

export const assertAndGetParameterName = (name: string): string =>
  assertNonEmptyString(name, "Parameter `name`");

export const assertAndGetParameterFormat = (name: string) =>
  assertAndGetFormat(name, "Parameter item", [
    ".json",
    ".cwl",
    ".yaml",
    ".yml",
    ".txt",
  ] as const);

export const assertAndGetParameterContent = (
  content: string | File | undefined,
) => assertPresent(content, "Parameter item is missing the content");

const PROCESS_CLASSES = [
  "Workflow",
  "CommandLineTool",
  "ExpressionTool",
  "Operation",
] as const;

type ProcessClass = (typeof PROCESS_CLASSES)[number];

const isProcessClass = (value: string): value is ProcessClass =>
  PROCESS_CLASSES.some((processClass) => processClass === value);

export const assertAndGetProcessClass = (cls: string): ProcessClass => {
  if (!cls || typeof cls !== "string" || cls.trim() === "") {
    throw new Error("A CWL process is missing the required `class` field");
  }

  if (!isProcessClass(cls)) {
    throw new Error(
      `A CWL process has an unknown 'class' field "${cls}", expected one of ${PROCESS_CLASSES.join(", ")}`,
    );
  }

  return cls;
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
