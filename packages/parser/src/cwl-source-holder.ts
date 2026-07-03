import YAML from "yaml";

import {
  CWLPackedDocument,
  CwlSource,
  CwlSourceDocument,
  CwlSourceDocumentContent,
  CwlSourceParameter,
  Process,
  Shape,
  Workflow,
  WorkflowStep,
} from "@theseus-cwl/types";

import { isPackedDocument, isWorkflow } from "./guards";
import {
  normalizeInput,
  normalizeOutput,
  normalizeStepIn,
  toRecordById,
} from "./normalize";
import {
  assertAndGetDocumentContent,
  assertAndGetDocumentFormat,
  assertAndGetDocumentName,
  assertAndGetParameterContent,
  assertAndGetParameterFormat,
  assertAndGetParameterName,
  assertAndGetProcessClass,
  assertAndGetStepRun,
  buildFallbackId,
} from "./utils";

/**
 * Holds a fully sanitized CWL source ({@link CwlSource}).
 *
 * A {@link CwlSource} can arrive in many loose forms (raw JSON/YAML, `File`, string,
 * or an already-parsed object, with shorthand inputs/steps and missing ids).
 * {@link CWLSourceHolder} is the boundary that turns the raw shape into the normalized {@link CWLSourceHolder<Shape.Sanitized>}.
 *
 * Instances are never constructed directly - the constructor is private and
 * does no parsing. Always build one via the async {@link CWLSourceHolder.create}
 * factory, which performs the sanitization.
 */
export class CWLSourceHolder {
  /** The normalized CWL source */
  public readonly source: CwlSource;

  /** The content of the document to render/edit by default. */
  public readonly activeFile: CwlSourceDocumentContent | undefined;

  private constructor(source: CwlSource) {
    this.source = source;

    this.activeFile = source.documents.find(
      (document) => document.name === source.entrypoint,
    )?.content;
  }

  /**
   * Creates a CWLSourceHolder
   *
   * @param {CwlSource<Shape.Raw>} source
   *
   * @returns {Promise<CWLSourceHolder>}
   */
  public static async create(
    source: CwlSource<Shape.Raw>,
  ): Promise<CWLSourceHolder> {
    const sanitizedDocuments = await this.sanitizeDocuments_(source.documents);
    const sanitizedParameters = await this.sanitizeParameters_(
      source.parameters,
    );

    const sanitizedSource: CwlSource = {
      ...source,
      documents: sanitizedDocuments,
      parameters: sanitizedParameters,
    };

    return new CWLSourceHolder(sanitizedSource);
  }

  /**
   * Normalizes the source documents (the CWL files themselves) into their sanitized form.
   *
   * @param {CwlSourceDocument<Shape.Raw>[]} documents
   *
   * @returns {Promise<CwlSourceDocument[]>}
   */
  private static async sanitizeDocuments_(
    documents: CwlSourceDocument<Shape.Raw>[],
  ): Promise<CwlSourceDocument[]> {
    return Promise.all(
      documents.map(async (document) => {
        const name = assertAndGetDocumentName(document.name);
        const format = assertAndGetDocumentFormat(name);
        const content = assertAndGetDocumentContent(document.content);

        let parsed:
          | undefined
          | Workflow<Shape.Raw>
          | CWLPackedDocument<Shape.Raw>
          | Process<Shape.Raw> = undefined;

        if (typeof content === "string") {
          parsed = this.parse_(content, format);
        } else if (content instanceof File) {
          parsed = this.parse_(await content.text(), format);
        } else if (typeof content === "object") {
          parsed = content;
        } else {
          throw new Error(
            `Document named ${name} has invalid content: expected a string, File, or object`,
          );
        }

        return {
          ...document,
          content: this.sanitizeDocument_(parsed),
        };
      }),
    );
  }

  /**
   * Normalizes the source parameters (the job-order/inputs files) into their canonical text form.
   *
   * @param {CwlSourceParameter[]} parameters
   *
   * @returns {Promise<CwlSourceParameter[]>}
   */
  private static async sanitizeParameters_(
    parameters: CwlSourceParameter[],
  ): Promise<CwlSourceParameter[]> {
    return Promise.all(
      parameters.map(async (parameter) => {
        const name = assertAndGetParameterName(parameter.name);
        assertAndGetParameterFormat(name);
        const content = assertAndGetParameterContent(parameter.content);

        if (typeof content === "string") {
          return parameter;
        }

        if (content instanceof File) {
          return {
            ...parameter,
            content: await content.text(),
          };
        }

        throw new Error(
          `Parameter named ${name} has invalid content: expected a string or File`,
        );
      }),
    );
  }

  /**
   * Normalizes a single CWL document object into its sanitized shape.
   *
   * @param {Workflow<Shape.Raw> | CWLPackedDocument<Shape.Raw> | Process<Shape.Raw>} document
   *
   * @returns {<CwlSourceDocumentContent>}
   */
  private static sanitizeDocument_(
    document:
      | Workflow<Shape.Raw>
      | CWLPackedDocument<Shape.Raw>
      | Process<Shape.Raw>,
  ): CwlSourceDocumentContent {
    if (isPackedDocument(document)) {
      const $graph = toRecordById(document.$graph, (process, id) => ({
        ...this.sanitizeProcess_(process),
        id: id,
      }));

      return { ...document, $graph: $graph } as CWLPackedDocument;
    }

    return this.sanitizeProcess_(document);
  }

  /**
   * Normalizes a single process (a `Workflow` or any non-packed `Process`) into its sanitized shape.
   *
   * @param {Workflow<Shape.Raw> | CWLPackedDocument<Shape.Raw> | Process<Shape.Raw>} process
   *
   * @returns { Process | Workflow}
   */
  private static sanitizeProcess_(
    process: Workflow<Shape.Raw> | Process<Shape.Raw>,
  ): Process | Workflow {
    assertAndGetProcessClass(process.class);
    const id = process.id?.trim() ? process.id : buildFallbackId(process);

    const inputs = toRecordById(process.inputs, normalizeInput);
    const outputs = toRecordById(process.outputs, normalizeOutput);

    if (isWorkflow(process)) {
      const steps = toRecordById(process.steps, (step, id): WorkflowStep => {
        const run = assertAndGetStepRun(step.run);

        return {
          ...step,
          id: id,
          run: typeof run === "string" ? run : this.sanitizeProcess_(run),
          in: normalizeStepIn(step.in),
        };
      });

      return {
        ...process,
        id: id,
        inputs: inputs,
        steps: steps,
        outputs: outputs,
      };
    }

    return {
      ...process,
      id: id,
      inputs: inputs,
      outputs: outputs,
    };
  }

  /**
   * Parses raw document text into an object according to the format.
   *
   * @param {string} text
   * @param {"json" | "yaml"} format
   *
   * @returns {CwlSourceDocumentContent}
   */
  private static parse_(
    text: string,
    format: "json" | "yaml",
  ): CwlSourceDocumentContent {
    return format === "json" ? JSON.parse(text) : YAML.parse(text);
  }
}
