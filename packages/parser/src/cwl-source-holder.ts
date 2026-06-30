import YAML from "yaml";

import {
  CWLPackedDocument,
  CwlSource,
  CwlSourceDocument,
  CwlSourceDocumentContent,
  CwlSourceParameter,
  Input,
  Process,
  Shape,
  Workflow,
  WorkflowOutput,
  WorkflowStep,
} from "@theseus-cwl/types";

import { isPackedDocument, isWorkflow } from "./guards";
import {
  normalizeInput,
  normalizeOutput,
  normalizeStepIn,
  toIdEntries,
} from "./normalize";

/**
 * Holds a fully sanitized CWL source together with the document that should
 * be displayed/edited by default (the "active file").
 *
 * A `CwlSource` can arrive in many loose forms (raw JSON/YAML, `File`, string,
 * or an already-parsed object, with shorthand inputs/steps and missing ids).
 * `CWLSourceHolder` is the boundary that turns any of those raw shapes into the
 * normalized `Shape.Sanitized` form the rest of the toolkit relies on: ids are
 * assigned, inputs/outputs/steps are expanded into keyed records, and packed
 * `$graph` documents are flattened.
 *
 * Instances are never constructed directly — the constructor is private and
 * does no parsing. Always build one via the async {@link CWLSourceHolder.create}
 * factory, which performs the sanitization (async because `File` content is
 * read via `File.text()`).
 */
export class CWLSourceHolder {
  /** The fully sanitized CWL source (documents and parameters normalized). */
  public readonly source: CwlSource;

  /**
   * The content of the document to render/edit by default: the document whose
   * `name` matches `source.entrypoint`, or `undefined` when no document
   * matches the entrypoint.
   */
  public readonly activeFile: CwlSourceDocumentContent;

  private constructor(source: CwlSource) {
    this.source = source;

    this.activeFile = source.documents.find(
      (file) => file.name === source.entrypoint,
    )?.content;
  }

  /**
   * Creates a CWLSourceHolder with a sanitized CWL source starting from a raw CWL source
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
   * Normalizes the source documents (the CWL files themselves) into their
   * sanitized object form.
   *
   * For each document the `name` and `content` are validated, then the format
   * is picked from the filename extension (`.json` → json; `.cwl`/`.yaml`/`.yml`
   * → yaml). The content is then resolved into a parsed object depending on its
   * type:
   * - `string` — parsed with `JSON.parse` or `YAML.parse` according to the
   *   detected format.
   * - `File` — read to a string via `File.text()`, then parsed as above.
   * - `object` — assumed already parsed and used as-is.
   *
   * The resulting object is run through {@link CWLSourceHolder.sanitizeDocument_}
   * so its content is returned in the normalized `Shape.Sanitized` shape.
   *
   * @throws if a document is missing its `name` or `content`, has an
   * unsupported file extension, or carries a content value that is not a
   * string, a `File`, or an object.
   */
  private static async sanitizeDocuments_(
    documents: CwlSourceDocument<Shape.Raw>[],
  ): Promise<CwlSourceDocument[]> {
    return Promise.all(
      documents.map(async (document) => {
        if (!document.name) {
          throw new Error("Document item is missing the name");
        }

        if (!document.content) {
          throw new Error("Document item is missing the content");
        }

        let format: "yaml" | "json" | undefined = undefined;
        const lowerCaseName = document.name.toLowerCase();

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
            `Document item named ${document.name} has an unsupported format, allowed extensions are .json, .yaml, .yml and .cwl`,
          );
        }

        let parsed:
          | Workflow<Shape.Raw>
          | CWLPackedDocument<Shape.Raw>
          | Process<Shape.Raw>;
        if (typeof document.content === "string") {
          parsed = this.parse_(document.content, format);
        } else if (document.content instanceof File) {
          parsed = this.parse_(await document.content.text(), format);
        } else if (typeof document.content === "object") {
          parsed = document.content;
        } else {
          throw new Error(
            `Document item named ${document.name} contains an invalid content`,
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
   * Normalizes the source parameters (the job-order / inputs files) into their
   * canonical text form.
   *
   * The content is never parsed into an object, it is preserved as text/
   *
   * Supported parameter content:
   * - `string` — the raw file contents, kept as-is. The `name` must still
   *   carry a supported extension (`.json`, `.yaml`, `.yml`, `.cwl`).
   * - `File` — read to a string via `File.text()`. The `name` must carry a
   *   supported extension; the format is limited to the same set as strings.
   *
   * @throws if a parameter is missing its `name` or `content`, has an
   * unsupported file extension, or carries a content value that is neither a
   * string nor a `File`.
   */
  private static async sanitizeParameters_(
    parameters: CwlSourceParameter[],
  ): Promise<CwlSourceParameter[]> {
    return Promise.all(
      parameters.map(async (parameter) => {
        if (!parameter.name) {
          throw new Error("Parameter item is missing the name");
        }

        if (!parameter.content) {
          throw new Error("Parameter item is missing the content");
        }

        const lowerCaseName = parameter.name.toLowerCase();
        const hasReadableFormat =
          lowerCaseName.endsWith(".json") ||
          lowerCaseName.endsWith(".yaml") ||
          lowerCaseName.endsWith(".yml") ||
          lowerCaseName.endsWith(".cwl") ||
          lowerCaseName.endsWith(".txt");

        if (!hasReadableFormat) {
          throw new Error(
            `Parameter item named ${parameter.name} has an unsupported format, allowed extensions are .json, .yaml, .yml and .cwl`,
          );
        }

        if (typeof parameter.content === "string") {
          return parameter;
        }

        if (parameter.content instanceof File) {
          return {
            ...parameter,
            content: await parameter.content.text(),
          };
        }

        throw new Error(
          `Parameter item named ${parameter.name} contains an invalid content`,
        );
      }),
    );
  }

  /**
   * Normalizes a single parsed CWL document object into its sanitized shape.
   *
   * - **Packed (`$graph`) documents** — the `$graph` is flattened into a record
   *   and every entry is sanitized via {@link CWLSourceHolder.sanitizeProcess_}.
   *   When `$graph` arrives as an array it is keyed by each entry's own `id`
   *   (an entry with no `id` is keyed under the literal string `"undefined"`,
   *   and entries sharing an `id` collide — the last one wins); an existing
   *   record is kept as-is. The entry's `id` is whatever `sanitizeProcess_`
   *   produces (its declared `id`, or a generated fallback) — it is NOT
   *   re-stamped from the graph key, so for a record `$graph` an entry's `id`
   *   may differ from its key.
   * - **Single Process / Workflow documents** — delegated directly to
   *   {@link CWLSourceHolder.sanitizeProcess_}.
   *
   * @returns the sanitized document (a `Process`, `Workflow`, or packed
   * `CWLPackedDocument`).
   */
  private static sanitizeDocument_(
    object:
      | Workflow<Shape.Raw>
      | CWLPackedDocument<Shape.Raw>
      | Process<Shape.Raw>,
  ): Process | Workflow | CWLPackedDocument {
    if (isPackedDocument(object)) {
      const graphAsRecord: Record<
        string,
        Workflow<Shape.Raw> | Process<Shape.Raw>
      > = Array.isArray(object.$graph)
        ? Object.fromEntries(
            object.$graph.map((process) => [process.id, process]),
          )
        : object.$graph;

      const sanitizedGraph: Record<string, Workflow | Process> = {};

      for (const [id, process] of Object.entries(graphAsRecord)) {
        sanitizedGraph[id] = {
          ...this.sanitizeProcess_(process),
        };
      }

      return {
        ...object,
        $graph: sanitizedGraph,
      } as CWLPackedDocument;
    } else {
      return this.sanitizeProcess_(object);
    }
  }

  /**
   * Normalizes a single process (a `Workflow` or any non-packed `Process`) into
   * its sanitized shape.
   *
   * `inputs`, `outputs` and `steps` may each be authored as a CWL identifier
   * map (`{ key: entry }`) or as the equivalent array of id-bearing entries
   * (`[{ id: key, ...entry }]`); {@link toIdEntries} accepts both and the
   * result is always a keyed record.
   *
   * - `inputs` — each entry becomes a keyed `Input`: string shorthand is
   *   expanded via {@link normalizeInput}, object inputs get `{ ...input, id: key }`.
   * - `outputs` — each entry becomes a keyed output via {@link normalizeOutput}:
   *   string shorthand is expanded to `{ id: key, type: <string> }`, object
   *   outputs get `{ ...output, id: key }`.
   * - `steps` (workflows only) — each step's inline `run` process is sanitized
   *   recursively (string `run` references are left untouched), its `in` is
   *   normalized via {@link normalizeStepIn}, and its `id` is stamped from the key.
   *
   * @returns the sanitized `Workflow` or `Process`.
   */
  private static sanitizeProcess_(
    object: Workflow<Shape.Raw> | Process<Shape.Raw>,
  ): Process | Workflow {
    const objectClass = object.class;

    if (
      !objectClass ||
      typeof objectClass !== "string" ||
      objectClass.trim() === ""
    ) {
      throw new Error("A CWL process is missing the required `class` field");
    }

    // A blank id (empty or whitespace-only) is treated as missing — `??`
    // alone would keep an explicit "" id, which is not a usable identifier.
    const id = object.id?.trim() ? object.id : this.buildFallbackId_(object);

    const newInputs: Record<string, Input> = {};
    for (const [inputId, input] of toIdEntries(object.inputs, "CWL `inputs`")) {
      newInputs[inputId] = normalizeInput(input, inputId);
    }

    const newOutputs: Record<string, WorkflowOutput> = {};
    for (const [outputId, output] of toIdEntries(
      object.outputs,
      "CWL `outputs`",
    )) {
      newOutputs[outputId] = normalizeOutput(output, outputId);
    }

    if (isWorkflow(object)) {
      const newSteps: Record<string, WorkflowStep> = {};

      for (const [stepId, step] of toIdEntries(object.steps, "CWL `steps`")) {
        const run =
          typeof step.run === "string"
            ? step.run
            : this.sanitizeProcess_(step.run);

        newSteps[stepId] = {
          ...step,
          run,
          in: normalizeStepIn(step.in),
          id: stepId,
        };
      }

      return {
        ...object,
        id,
        inputs: newInputs,
        steps: newSteps,
        outputs: newOutputs,
      };
    }

    return {
      ...object,
      id,
      inputs: newInputs,
      outputs: newOutputs,
    };
  }

  /**
   * Builds a deterministic fallback `id` for a process that does not declare
   * one.
   */
  private static buildFallbackId_(
    object: Workflow<Shape.Raw> | Process<Shape.Raw>,
  ): string {
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
  }

  /**
   * Parses raw document text into an object according to the detected format:
   * `JSON.parse` for json, `YAML.parse` for yaml.
   */
  private static parse_(
    text: string,
    format: "json" | "yaml",
  ): Workflow<Shape.Raw> | CWLPackedDocument<Shape.Raw> | Process<Shape.Raw> {
    return format === "json" ? JSON.parse(text) : YAML.parse(text);
  }
}
