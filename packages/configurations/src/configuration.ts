/**
 * Theseus-CWL runtime configuration.
 *
 * All tunable values live in this single module on purpose: the bindings are
 * mutable (`let`) so that {@link configureTheseusCwl} can override them at
 * runtime. Because ES modules expose *live bindings*, every consumer that does
 * `import { NODE_WIDTH } from "@theseus-cwl/configurations"` and reads the
 * value at call time observes the override — without any further wiring. A
 * module can only reassign the bindings it owns, which is why these are
 * co-located here rather than split across files.
 *
 * @example
 * ```ts
 * import { configureTheseusCwl } from "@theseus-cwl/configurations";
 *
 * // Call once at app startup, before the viewer renders.
 * configureTheseusCwl({
 *   NODE_WIDTH: 140,
 *   INPUT_NODE_COLOR: "#aabbcc",
 *   ANIMATION_TIME: 300,
 * });
 * ```
 */

/**
 * The default animation time in milliseconds
 */
export let ANIMATION_TIME = 700;

/**
 * The keywords offered by the editor autocomplete
 */
export let CWL_FILE_KEYWORDS = [
  "cwlVersion",
  "class",
  "inputs",
  "outputs",
  "steps",
  "baseCommand",
  "requirements",
  "hints",
  "arguments",
];

/**
 * The documentation shown when hovering CWL keywords
 */
export let CWL_FILE_KEYWORDS_DOCUMENTATION: Record<string, string> = {
  cwlVersion: "The CWL version (e.g., v1.0, v1.2)",
  class: "Specifies the type: CommandLineTool, Workflow, ExpressionTool",
  inputs: "Input parameters for this tool or workflow",
  outputs: "Outputs produced by this tool or workflow",
  steps: "Workflow steps, mapping names to tools",
};

/**
 * The CWL input default node color
 */
export let INPUT_NODE_COLOR = "#85FFC7";

/**
 * The CWL step default node color
 */
export let STEP_NODE_COLOR = "#FF8552";

/**
 * The CWL output default node color
 */
export let OUTPUT_NODE_COLOR = "#297373";

const GOLDEN_RATIO = 1.618;

/**
 * The CWL node default height
 */
export let NODE_HEIGHT = 75;

/**
 * The CWL node default width (defaults to the golden ratio of the height)
 */
export let NODE_WIDTH = Math.round(NODE_HEIGHT * GOLDEN_RATIO);

/**
 * The CWL node default margin
 */
export let NODE_MARGIN = 17;

/**
 * The default scaling factor applied to subworkflow nodes
 */
export let SUBWORKFLOW_NODE_SCALING_FACTOR = 0.8;

/**
 * The CWL viewer default padding
 */
export let VIEWER_PADDING = 20;

/**
 * How long (ms) to wait after the last keystroke before emitting the updated
 * source. Debouncing avoids consumers re-parsing (and re-validating) on every
 * character and prevents error flicker on transient, half-typed YAML.
 */
export let CWL_EDITOR_ONCHANGE_DEBOUNCE_MS = 300

/**
 * Every value that can be overridden via {@link configureTheseusCwl}.
 */
export type TheseusCwlConfiguration = {
  ANIMATION_TIME: number;
  CWL_FILE_KEYWORDS: string[];
  CWL_FILE_KEYWORDS_DOCUMENTATION: Record<string, string>;
  INPUT_NODE_COLOR: string;
  STEP_NODE_COLOR: string;
  OUTPUT_NODE_COLOR: string;
  NODE_HEIGHT: number;
  NODE_WIDTH: number;
  NODE_MARGIN: number;
  SUBWORKFLOW_NODE_SCALING_FACTOR: number;
  VIEWER_PADDING: number;
  CWL_EDITOR_ONCHANGE_DEBOUNCE_MS: number;
};

/**
 * The immutable default values, used to restore state in
 * {@link resetTheseusCwlConfiguration}.
 */
const DEFAULTS: TheseusCwlConfiguration = {
  ANIMATION_TIME,
  CWL_FILE_KEYWORDS: [...CWL_FILE_KEYWORDS],
  CWL_FILE_KEYWORDS_DOCUMENTATION: { ...CWL_FILE_KEYWORDS_DOCUMENTATION },
  INPUT_NODE_COLOR,
  STEP_NODE_COLOR,
  OUTPUT_NODE_COLOR,
  NODE_HEIGHT,
  NODE_WIDTH,
  NODE_MARGIN,
  SUBWORKFLOW_NODE_SCALING_FACTOR,
  VIEWER_PADDING,
  CWL_EDITOR_ONCHANGE_DEBOUNCE_MS,
};

/**
 * Override one or more configuration values at runtime. Only the keys you pass
 * are changed; everything else keeps its current value.
 *
 * Call this once during app startup, before the viewer/editor mount, so the new
 * values are in effect the first time nodes and edges are computed.
 *
 * Note: if you override `NODE_HEIGHT` without also passing `NODE_WIDTH`, the
 * width is recomputed from the new height using the golden ratio (matching the
 * default behaviour). Pass `NODE_WIDTH` explicitly to opt out.
 */
export const configureTheseusCwl = (
  overrides: Partial<TheseusCwlConfiguration>,
): void => {
  if (overrides.NODE_HEIGHT !== undefined) {
    NODE_HEIGHT = overrides.NODE_HEIGHT;
  }

  if (overrides.NODE_WIDTH !== undefined) {
    NODE_WIDTH = overrides.NODE_WIDTH;
  } else if (overrides.NODE_HEIGHT !== undefined) {
    NODE_WIDTH = Math.round(overrides.NODE_HEIGHT * GOLDEN_RATIO);
  }

  if (overrides.NODE_MARGIN !== undefined) {
    NODE_MARGIN = overrides.NODE_MARGIN;
  }

  if (overrides.SUBWORKFLOW_NODE_SCALING_FACTOR !== undefined) {
    SUBWORKFLOW_NODE_SCALING_FACTOR = overrides.SUBWORKFLOW_NODE_SCALING_FACTOR;
  }

  if (overrides.INPUT_NODE_COLOR !== undefined) {
    INPUT_NODE_COLOR = overrides.INPUT_NODE_COLOR;
  }

  if (overrides.STEP_NODE_COLOR !== undefined) {
    STEP_NODE_COLOR = overrides.STEP_NODE_COLOR;
  }

  if (overrides.OUTPUT_NODE_COLOR !== undefined) {
    OUTPUT_NODE_COLOR = overrides.OUTPUT_NODE_COLOR;
  }

  if (overrides.VIEWER_PADDING !== undefined) {
    VIEWER_PADDING = overrides.VIEWER_PADDING;
  }

  if (overrides.ANIMATION_TIME !== undefined) {
    ANIMATION_TIME = overrides.ANIMATION_TIME;
  }

  if (overrides.CWL_FILE_KEYWORDS !== undefined) {
    CWL_FILE_KEYWORDS = overrides.CWL_FILE_KEYWORDS;
  }

  if (overrides.CWL_FILE_KEYWORDS_DOCUMENTATION !== undefined) {
    CWL_FILE_KEYWORDS_DOCUMENTATION = overrides.CWL_FILE_KEYWORDS_DOCUMENTATION;
  }
  
  if (overrides.CWL_EDITOR_ONCHANGE_DEBOUNCE_MS !== undefined) {
    CWL_EDITOR_ONCHANGE_DEBOUNCE_MS = overrides.CWL_EDITOR_ONCHANGE_DEBOUNCE_MS;
  }
};

/**
 * Restore every configuration value to its built-in default.
 */
export const resetTheseusCwlConfiguration = (): void => {
  configureTheseusCwl({
    ...DEFAULTS,
    CWL_FILE_KEYWORDS: [...DEFAULTS.CWL_FILE_KEYWORDS],
    CWL_FILE_KEYWORDS_DOCUMENTATION: {
      ...DEFAULTS.CWL_FILE_KEYWORDS_DOCUMENTATION,
    },
  });
};
