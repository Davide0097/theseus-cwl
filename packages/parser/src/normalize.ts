import {
  Input,
  Output,
  Shape,
  Type,
  WorkflowOutput,
  WorkflowStep,
  WorkflowStepInput,
} from "@theseus-cwl/types";

/**
 * Stamps an explicit `id` onto a raw parameter.
 *
 * A raw input/output may be authored as a full object, as a type shorthand
 * string (`"string"`, `"File[]"`), or as a union-type list (`["null", "File"]`).
 * An object gets the id merged in (overwriting any authored id, since the
 * record key is canonical); a string/list is assigned to the `type` field.
 * Anything else is not a recognized parameter shape and is rejected — `kind`
 * ("input"/"output") names the offending field in the error.
 */
const stampId = (
  value: unknown,
  id: string,
  kind: "input" | "output",
): unknown => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...value, id: id };
  }

  if (typeof value === "string" || Array.isArray(value)) {
    return { id: id, type: value };
  }

  throw new Error(
    `${kind} "${id}" has an invalid value: expected a type string, a type list, or an object`,
  );
};

/**
 * Normalizes a single raw input parameter into its sanitized, keyed form.
 *
 * @param input - the raw input: a type shorthand string or an input object.
 * @param id - the record key to stamp as the input's `id`.
 *
 * @returns {Input}
 */
export const normalizeInput = (input: Input<Shape.Raw>, id: string): Input =>
  stampId(input, id, "input") as Input;

/**
 * Normalizes a single raw output parameter into its sanitized, keyed form.
 *
 * @param output - the raw output: a type shorthand string or an output object.
 * @param id - the record key to stamp as the output's `id`.
 *
 * @returns {WorkflowOutput}
 */
export const normalizeOutput = (
  output: Output | Type,
  id: string,
): WorkflowOutput => stampId(output, id, "output") as WorkflowOutput;

/**
 * Normalizes a single step-input value.
 *
 * A step input may be authored as a full {@link WorkflowStepInput} object, or
 * as a `source` shorthand (a single upstream id, or a list of them). The map
 * key is the canonical id, so any `id` on the object itself is dropped — this
 * keeps the map and list authoring forms producing an identical shape.
 */
const normalizeStepInValue = (
  value: unknown,
  id: string,
): WorkflowStepInput => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const stepInput = { ...(value as WorkflowStepInput & { id?: string }) };
    delete stepInput.id;
    return stepInput;
  }

  if (Array.isArray(value) || (typeof value === "string" && value)) {
    return { source: value as string | string[] };
  }

  throw new Error(
    `Step input "${id}" has an invalid value: expected a source string, a source list, or an object`,
  );
};

/**
 * Normalizes a workflow step's `in` into a record of {@link WorkflowStepInput} objects.
 *
 * @param {WorkflowStep<Shape.Raw>["in"]} stepIn
 *
 * @returns {Record<string, WorkflowStepInput>}
 */
export const normalizeStepIn = (
  stepIn: WorkflowStep<Shape.Raw>["in"],
): Record<string, WorkflowStepInput> => {
  if (!stepIn) {
    throw new Error("The workflow step is missing the required `in` mapping");
  }

  return toRecordById<WorkflowStepInput | string, WorkflowStepInput>(
    stepIn,
    normalizeStepInValue,
  );
};

/**
 * Reads the required `id` from a list form entry.
 */
const idOf = (entry: unknown): string => {
  const id =
    entry && typeof entry === "object"
      ? (entry as { id?: unknown }).id
      : undefined;

  if (typeof id !== "string" || !id.trim()) {
    throw new Error("A list entry is missing its required `id`");
  }

  return id;
};

/**
 * Turns array and map keyed fields into a record.
 *
 * CWL lets fields like `inputs`, `outputs`, `steps` and a step's `in` be
 * authored either as a map keyed by id, or as the equivalent list of
 * id-bearing entries (the spec requires consumers to accept both).
 * This turns either form into a record, running `normalize` on each entry and rejecting
 * duplicate ids. In list form the id comes from the entry itself; in map form
 * it is the key.
 *
 * @param {Record<string, In> | In[] | undefined} field
 * @param {(entry: In, id: string) => Out} normalize
 *
 * @returns {Record<string, Out>}
 */
export const toRecordById = <In, Out>(
  field: Record<string, In> | In[] | undefined,
  normalize: (entry: In, id: string) => Out,
): Record<string, Out> => {
  const record: Record<string, Out> = {};
  if (!field) {
    return record;
  }

  const isList = Array.isArray(field);

  for (const [key, entry] of Object.entries(field)) {
    const id = isList ? idOf(entry) : key;

    if (id in record) {
      throw new Error(`Found more than one entry with id "${id}"`);
    }

    record[id] = normalize(entry, id);
  }

  return record;
};
