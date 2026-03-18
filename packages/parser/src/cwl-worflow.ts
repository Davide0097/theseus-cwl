import YAML from "yaml";

import {
  CWLPackedDocument,
  CwlSource,
  CwlSourceDocument,
  CwlSourceParameter,
  Input,
  Process,
  Shape,
  Type,
  Workflow,
  WorkflowOutput,
  WorkflowStep,
  WorkflowStepInput,
} from "@theseus-cwl/types";

export const isPackedDocument = (
  object:
    | CWLPackedDocument
    | Workflow
    | Process
    | CWLPackedDocument<Shape.Raw>
    | Workflow<Shape.Raw>
    | Process<Shape.Raw>,
): object is CWLPackedDocument => {
  return typeof object === "object" && object !== null && "$graph" in object;
};

export const isWorkflow = (obj: any): obj is Workflow => {
  return obj.class === "Workflow";
};

export const normalizeInput = (
  input: Input<Shape.Raw> | Input,
  key: string,
): Input<Shape.Sanitized> => {
  if (typeof input === "string") {
    return {
      id: key,
      type: "string" as Type,
    };
  } else if (typeof input === "object") {
    return { ...input, id: key };
  } else return input;
};

export const normalizeStepsIn = (
  stepIn: WorkflowStep<Shape.Raw>["in"],
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
  public readonly activeFile: Workflow | CWLPackedDocument | Process;

  private constructor(source: CwlSource) {
    this.source = source;
    // Todo! active file should be set as the selected file otherwise the entrypoint
    this.activeFile =
      source.documents.find((file) => file.name === source.entrypoint)
        ?.content || source.documents[0]?.content!;
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

    const sanitizedSource: CwlSource = {
      ...source,
      documents: [sanitizedDocuments[0]!],
      parameters: sanitizedParameters,
    };

    return new CWLSourceHolder(sanitizedSource);
  }

  private static sanitizeDocuments_(
    source: CwlSource<Shape.Raw>,
  ): Promise<CwlSourceDocument[]> {
    return Promise.all(
      source.documents.map(async (document) => {
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
              content: this.sanitizeCwlDocument_(fileContent),
            };
          } else if (format === "yaml") {
            const fileContent = YAML.parse(document.content);
            return {
              ...document,
              content: this.sanitizeCwlDocument_(fileContent),
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
              content: this.sanitizeCwlDocument_(JSON.parse(fileContent)),
            };
          } else if (format === "yaml") {
            const fileContent = await document.content.text();
            return {
              ...document,
              content: this.sanitizeCwlDocument_(YAML.parse(fileContent)),
            };
          } else {
            throw new Error(
              `The document file ${document.name} is missing the right format, allowed are YAML and JSON extension and as a content the yaml/json file`,
            );
          }
        } else if (typeof document.content === "object") {
          return {
            ...document,
            content: this.sanitizeCwlDocument_(document.content),
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
  ): Promise<CwlSourceParameter[]> {
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

  private static sanitizeCwlDocument_(
    object:
      | Workflow<Shape.Raw>
      | Workflow
      | CWLPackedDocument<Shape.Raw>
      | CWLPackedDocument
      | Process<Shape.Raw>
      | Process,
  ): Process | Workflow | CWLPackedDocument {
    if (isPackedDocument(object)) {
      const graphAsRecord: Record<string, Workflow | Process> = Array.isArray(
        object.$graph,
      )
        ? Object.fromEntries(
            object.$graph
              .filter((process) => process.id)
              .map((process) => [process.id, process]),
          )
        : object.$graph;

      const newGraph: Record<string, Workflow | Process> = {};

      for (const [id, process] of Object.entries(graphAsRecord)) {
        newGraph[id] = {
          ...this.sanitizeProcess(process),
          id: id,
        };
      }

      return {
        ...object,
        $graph: newGraph,
      } as CWLPackedDocument;
    } else {
      return this.sanitizeProcess(object);
    }
  }

  private static sanitizeProcess(
    object: Workflow<Shape.Raw> | Workflow | Process<Shape.Raw> | Process,
  ): Process | Workflow {
    const newInputs: Record<string, Input> = {};
    if (object.inputs) {
      for (const [key, input] of Object.entries(object.inputs)) {
        if (typeof input === "string") {
          newInputs[key] = normalizeInput(input, key);
        } else {
          newInputs[key] = { ...input, id: key };
        }
      }
    }

    const newOutputs: Record<string, WorkflowOutput> = {};
    if (object.outputs) {
      for (const [key, output] of Object.entries(object.outputs)) {
        newOutputs[key] = { ...output, id: key };
      }
    }

    if (isWorkflow(object)) {
      const newSteps: Record<string, WorkflowStep> = {};

      if (object.steps) {
        for (const [key, step] of Object.entries(object.steps)) {
          const run =
            typeof step.run === "string"
              ? step.run
              : this.sanitizeProcess(step.run);

          newSteps[key] = {
            ...step,
            run,
            in: normalizeStepsIn(step.in),
            id: key,
          };
        }
      }

      return {
        ...object,
        id: object.id || `workflow_${Math.random().toFixed(2).toString()}`,
        inputs: newInputs,
        steps: newSteps,
        outputs: newOutputs,
      };
    }

    return {
      ...object,
      id: object.id || `process_${Math.random().toFixed(2).toString()}`,
      inputs: newInputs,
      outputs: newOutputs,
    };
  }
}
