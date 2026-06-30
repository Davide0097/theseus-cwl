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
 * Stamps an explicit `id` onto a raw input/output parameter, normalizing the
 * two shorthand forms CWL allows:
 * - `string` shorthand → `{ id, type: <string> }`.
 * - object → `{ ...value, id }`.
 *
 * Any other value is returned unchanged. Shared by {@link normalizeInput} and
 * {@link normalizeOutput}, which are identical apart from their input/output
 * typing — this is the single behavioral definition both delegate to.
 */
const stampId = (value: unknown, id: string): unknown => {
  if (typeof value === "string") {
    return {
      id,
      type: value,
    };
  } else if (typeof value === "object") {
    return { ...value, id };
  } else return value;
};

/**
 * Yields `[id, entry]` pairs from a CWL field that may be authored either as an
 * identifier map (`{ foo: <entry> }`) or as the equivalent list of entries that
 * each carry their own `id` (`[{ id: "foo", ...entry }]`).
 *
 * Both forms are valid CWL: the array is the schema's normative shape and the
 * map is sugar over it (Schema Salad `mapSubject: id`), and the spec requires
 * consumers to accept both. `inputs`, `outputs`, `steps` and a step's `in` all
 * run through here so either form normalizes to the same keyed record.
 *
 * - **map** — returned verbatim as `Object.entries(field)`.
 * - **array** — each entry is keyed by its own `id`, which CWL requires for the
 *   array form. An entry that is not an object, or whose `id` is missing/blank,
 *   throws: the array form has no outer key to fall back to. (A blank or
 *   whitespace-only `id` is treated as missing, matching how blank process ids
 *   are handled in {@link CWLSourceHolder.sanitizeProcess_}.)
 *
 * @param fieldName - human-readable label of the field, used only to make the
 * missing-`id` error message point at the offending field.
 */
export const toIdEntries = <V>(
  field: Record<string, V> | V[] | undefined,
  fieldName: string,
): [string, V][] => {
  if (!field) {
    return [];
  }

  if (Array.isArray(field)) {
    return field.map((entry, index): [string, V] => {
      const entryId =
        entry && typeof entry === "object"
          ? (entry as { id?: unknown }).id
          : undefined;

      if (typeof entryId !== "string" || !entryId.trim()) {
        throw new Error(
          `A ${fieldName} entry authored in array form is missing its required \`id\` (index ${index}).`,
        );
      }

      return [entryId, entry];
    });
  }

  return Object.entries(field);
};

/**
 * Normalizes a single raw input parameter into its sanitized, keyed form.
 *
 * In a raw document an input may be written either as a type shorthand string
 * (e.g. `"string"`) or as a full input object. Either way the result carries
 * an explicit `id` taken from the record key:
 * - `string` shorthand → `{ id: inputId, type: <string> }`.
 * - object → `{ ...input, id: inputId }`.
 *
 * Any other value is returned unchanged.
 *
 * @param input - the raw input: a type shorthand string or an input object.
 * @param inputId - the record key to stamp as the input's `id`.
 */
export const normalizeInput = (
  input: Input<Shape.Raw>,
  inputId: string,
): Input => stampId(input, inputId) as Input;

/**
 * Normalizes a single raw output parameter into its sanitized, keyed form.
 *
 * Mirrors {@link normalizeInput}: in a raw document an output may be written
 * either as a type shorthand string (e.g. `"File"`) or as a full output
 * object. Either way the result carries an explicit `id` taken from the
 * record key:
 * - `string` shorthand → `{ id: outputId, type: <string> }`.
 * - object → `{ ...output, id: outputId }`.
 *
 * Any other value is returned unchanged.
 *
 * @param output - the raw output: a type shorthand string or an output object.
 * @param outputId - the record key to stamp as the output's `id`.
 */
export const normalizeOutput = (
  output: Output | Type,
  outputId: string,
): WorkflowOutput => stampId(output, outputId) as WorkflowOutput;

/**
 * Normalizes a workflow step's `in` into a record of {@link WorkflowStepInput}
 * objects.
 *
 * `in` may be authored as an identifier map or as the equivalent array of
 * id-bearing entries (see {@link toIdEntries}); each entry is then either a
 * `source` shorthand string or a full step-input object:
 * - `string` → `{ source: <string> }`.
 * - object → kept as-is, minus any `id` (in the array form the `id` is the
 *   parameter name and becomes the record key, so both forms produce the same
 *   shape).
 *
 * @throws if `in` is missing — it is a required field on a workflow step.
 */
export const normalizeStepIn = (
  stepIn: WorkflowStep<Shape.Raw>["in"],
): Record<string, WorkflowStepInput> => {
  // `in` is a required field on a workflow step; preserve that contract with a
  // clear error instead of the cryptic TypeError `Object.entries(undefined)`
  // would otherwise throw.
  if (!stepIn) {
    throw new Error("A workflow step is missing the required `in` mapping");
  }

  const normalized: Record<string, WorkflowStepInput> = {};

  for (const [stepInKey, stepInValue] of toIdEntries(
    stepIn,
    "workflow step `in`",
  )) {
    if (stepInValue && typeof stepInValue === "string") {
      normalized[stepInKey] = { source: stepInValue };
    } else if (stepInValue && typeof stepInValue === "object") {
      const value: WorkflowStepInput & { id?: string } = { ...stepInValue };
      delete value.id;
      normalized[stepInKey] = value;
    }
  }

  return normalized;
};
