import YAML from "yaml";

import {
  CWLPackedDocument,
  CwlSource,
  CwlSourceDocument,
  CwlSourceParameter,
  Input,
  Shape,
  Type,
  Workflow,
  WorkflowOutput,
  WorkflowStep,
  WorkflowStepInput,
} from "@theseus-cwl/types";

export const isPackedDocument = <T extends Shape>(
  object: CWLPackedDocument<T> | Workflow<T>,
): object is CWLPackedDocument<T> => {
  return typeof object === "object" && object !== null && "$graph" in object;
};

export const normalizeInput = (
  input: Input<Shape.Raw | Shape.Raw>,
): Input<Shape.Sanitized> => {
  let normalized;

  if (typeof input === "string") {
    normalized = {
      id: input,
      type: "string" as Type,
    };
  } else {
    normalized = input as unknown as Input<Shape.Sanitized>;
  }

  return normalized;
};

export const normalizeStepsIn = (
  stepIn: WorkflowStep<Shape.Raw | Shape.Raw>["in"],
): Record<string, WorkflowStepInput> => {
  const normalized: Record<string, WorkflowStepInput> = {};

  Object.entries(stepIn).forEach(([stepInKey, stepIn]) => {
    if (stepIn && typeof stepIn === "string") {
      normalized[stepInKey] = { source: stepIn };
    } else if (stepIn && typeof stepIn === "object") {
      normalized[stepInKey] = stepIn;
    }
  });

  return normalized;
};

export class CWLSourceHolder {
  public readonly source: CwlSource;
  public readonly activeFile: Workflow | CWLPackedDocument;

  private constructor(source: CwlSource<Shape.Sanitized>) {
    this.source = source;
    // Todo! active file should be set as the selected file otherwise the entrypoint
    this.activeFile =
      (source.documents.find((file) => file.name === source.entrypoint)
        ?.content as Workflow | CWLPackedDocument) ||
      source.documents[0]?.content;
  }

  /**
   *
   * @param {CwlSource<Shape.Raw>} source
   *
   * @returns {Promise<CWLSourceHolder>}
   */
  public static async create(
    source: CwlSource<Shape.Raw>,
  ): Promise<CWLSourceHolder> {
    const sanitizedDocuments = await this.sanitizeDocuments_(source);
    const sanitizedParameters = await this.sanitizeParameters_(source);

    const sanitizedSource: CwlSource<Shape.Sanitized> = {
      ...source,
      documents: [sanitizedDocuments[0]!],
      parameters: sanitizedParameters,
    };

    return new CWLSourceHolder(sanitizedSource);
  }

  private static sanitizeDocuments_(
    source: CwlSource<Shape.Raw>,
  ): Promise<CwlSourceDocument<Shape.Sanitized>[]> {
    return Promise.all(
      source.documents.map(async (document: CwlSourceDocument<Shape.Raw>) => {
        if (!document.name) {
          throw new Error("Document file is missing the name");
        }

        if (!document.content) {
          throw new Error("Document file is missing the content");
        }

        const format: "yaml" | "json" | undefined =
          document.name?.endsWith(".json") || document.name?.endsWith(".JSON")
            ? "json"
            : document.name?.endsWith(".CWL") ||
                document.name?.endsWith(".cwl") ||
                document.name?.endsWith(".yaml") ||
                document.name?.endsWith(".YAML") ||
                document.name?.endsWith(".yml") ||
                document.name?.endsWith(".YML")
              ? "yaml"
              : undefined;

        if (typeof document.content === "string") {
          if (format === "json") {
            const fileContent = JSON.parse(document.content);
            return {
              ...document,
              content: this.sanitize_(fileContent),
            };
          } else if (format === "yaml") {
            const fileContent = YAML.parse(document.content);
            return {
              ...document,
              content: this.sanitize_(fileContent),
            };
          } else {
            throw new Error(
              `The document file ${document.name} is missing the right format, allowed formats are .CWL .YAML and .JSON extension and as a content the stringified yaml/json file`,
            );
          }
        } else if (document.content instanceof File) {
          if (format === "json") {
            const fileContent = await document.content.text();
            return {
              ...document,
              content: this.sanitize_(JSON.parse(fileContent)),
            };
          } else if (format === "yaml") {
            const fileContent = await document.content.text();
            return {
              ...document,
              content: this.sanitize_(YAML.parse(fileContent)),
            };
          } else {
            throw new Error(
              `The document file ${document.name} is missing the right format, allowed are YAML and JSON extension and as a content the yaml/json file`,
            );
          }
        } else if (typeof document.content === "object") {
          return {
            ...document,
            content: this.sanitize_(document.content),
          };
        } else {
          throw new Error(
            `Document file named ${document.name} contains an invalid content`,
          );
        }
      }),
    );
  }

  private static sanitizeParameters_(
    source: CwlSource<Shape.Raw>,
  ): Promise<CwlSourceParameter<Shape.Sanitized>[]> {
    return Promise.all(
      source.parameters.map(async (parameter) => {
        if (!parameter.name) {
          throw new Error("Parameter file is missing the name");
        }

        if (!parameter.content) {
          throw new Error("Parameter file is missing the content");
        }

        const hasReadableformat: "yaml" | "json" | undefined =
          parameter.name?.endsWith(".json") || parameter.name?.endsWith(".JSON")
            ? "json"
            : parameter.name?.endsWith(".CWL") ||
                parameter.name?.endsWith(".cwl") ||
                parameter.name?.endsWith(".yaml") ||
                parameter.name?.endsWith(".YAML")
              ? "yaml"
              : undefined;

        if (typeof parameter.content === "string") {
          return {
            ...parameter,
          };
        } else if (parameter.content instanceof File) {
          if (hasReadableformat) {
            const fileContent = await parameter.content.text();
            return {
              ...parameter,
              content: fileContent,
            };
          } else {
            return {
              ...parameter,
            };
          }
        } else {
          throw new Error(
            `Document file named ${parameter.name} contains an invalid content`,
          );
        }
      }),
    );
  }

  private static sanitize_(
    obj: Workflow<Shape.Raw> | CWLPackedDocument<Shape.Raw>,
  ): Workflow | CWLPackedDocument {
    let sanitizedObj: Workflow | CWLPackedDocument;

    if (isPackedDocument(obj)) {
      if (Array.isArray(obj.$graph)) {
        const graphAsRecord: Record<string, Workflow> = {};
        obj.$graph.forEach((wf) => {
          graphAsRecord[wf.id] = wf;
        });
        obj.$graph = graphAsRecord;
      }
    }

    if (isPackedDocument(obj)) {
      const newGraph: Record<string, Workflow> = {};
      for (const [key, wf] of Object.entries(obj.$graph)) {
        newGraph[key] = {
          ...this.sanitizeWorkflow(wf),
          id: wf.id || key,
        } as Workflow;
      }
      sanitizedObj = { ...obj, $graph: newGraph } as CWLPackedDocument;
      return sanitizedObj;
    } else {
      return this.sanitizeWorkflow(obj);
    }
  }

  private static sanitizeWorkflow(wf: Workflow<Shape.Raw>): Workflow {
    const newInputs: Record<string, Input> = {};
    if (wf.inputs) {
      for (const [key, input] of Object.entries(wf.inputs)) {
        if (typeof input === "string") {
          newInputs[key] = { ...normalizeInput(input), id: key };
        } else {
          newInputs[key] = { ...input, id: key };
        }
      }
    }

    const newSteps: Record<string, WorkflowStep> = {};
    if (wf.steps) {
      for (const [key, step] of Object.entries(wf.steps)) {
        newSteps[key] = {
          ...step,
          in: normalizeStepsIn(step.in),
          id: key,
        } as WorkflowStep;
      }
    }

    const newOutputs: Record<string, WorkflowOutput> = {};
    if (wf.outputs) {
      for (const [key, output] of Object.entries(wf.outputs)) {
        newOutputs[key] = { ...output, id: key };
      }
    }

    return {
      ...wf,
      id: wf.id ?? "Workflow",
      inputs: newInputs,
      steps: newSteps,
      outputs: newOutputs,
    };
  }
}
