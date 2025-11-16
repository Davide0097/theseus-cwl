import { Node as xyflowNode } from "@xyflow/react";

import {
  EDITOR_PADDING,
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";
import { WorkflowStep } from "@theseus-cwl/types";

import { StepNodeComponent } from "../../ui";
import { getMaxBottom, getMaxRight, hexToRgba } from "../general";
import { BaseInitializeNodeProps } from "./initialize-input-nodes";

export type TropologicalSortStepsConfig = {
  steps: Record<string, WorkflowStep>;
};

/**
 * Performs a topological sort on a CWL workflow step graph.
 *
 * Given a set of steps and their declared inputs (dependencies),
 * this function produces:
 *  - A sorted list of steps (respecting dependency order).
 *  - A mapping of step keys to generated IDs..
 *
 * The algorithm is based on Kahn's algorithm for topological sorting.
 */
export const topologicalSortSteps = (config: TropologicalSortStepsConfig) => {
  const { steps } = config;

  /** Dependency graph: stepKey -> set of steps that depend on it. */
  const graph: Record<string, Set<string>> = {};

  /** In-degree: number of incoming edges (dependencies) for each step. */
  const inDegree: Record<string, number> = {};

  const stepKeys = Object.keys(steps);

  /** Initialize graph and in-degree counts. */
  for (const key of stepKeys) {
    graph[key] = new Set();
    inDegree[key] = 0;
  }

  /** Build the graph based on declared inputs for each step. */
  for (const [stepKey, step] of Object.entries(steps)) {
    const inputDefs = Object.values(step.in || {});

    // Normalize sources into a flat array of strings
    const sources = inputDefs
      .flatMap((input) =>
        typeof input !== "string" && Array.isArray(input.source)
          ? input.source
          : typeof input !== "string" && !Array.isArray(input.source)
            ? [input.source]
            : (input as string)
      )
      /** take step before "/" if present */
      .map((src) => src?.split("/")[0])
      .filter((src): src is string => Boolean(src && steps[src]));

    for (const source of sources) {
      graph[source]!.add(stepKey);
      inDegree[stepKey]!++;
    }
  }

  const sortedSteps: WorkflowStep[] = [];
  const idMap: Record<string, string> = {};

  /** Start with all steps that have no dependencies. */
  const queue = stepKeys.filter((key) => inDegree[key] === 0);

  /** Kahn’s algorithm: repeatedly remove nodes with in-degree 0. */
  while (queue.length) {
    const current = queue.shift()!;
    const step = steps[current];

    /** Generate a stable ID (currently just the key). */
    const generatedId = current;
    idMap[current] = generatedId;
    sortedSteps.push(step!);

    if (graph[current]) {
      /** Decrease in-degree of neighbors; enqueue if they become ready. */
      for (const neighbor of graph[current]) {
        if (inDegree[neighbor]) {
          inDegree[neighbor]--;
        }

        if (inDegree[neighbor] === 0) queue.push(neighbor);
      }
    }
  }

  return { sortedSteps, idMap };
};

/**
 * Props for {@link initializeStepNodes}
 */
export type InitializeStepsProps = BaseInitializeNodeProps<
  Record<string, WorkflowStep>
> & { isSubWorkflow: boolean };

/**
 * Initializes step nodes.
 *
 * Takes CWL output information as {@link Steps} and
 * reuturns an array of {@link xyFlowNode} objects that xyFlow uses to render the step nodes.
 */
export const initializeStepNodes = (
  props: InitializeStepsProps
): xyflowNode<{step: WorkflowStep}>[] => {
  const { nodesInfo, color, readOnly, isSubWorkflow } = props;

  const { sortedSteps, idMap } = topologicalSortSteps({ steps: nodesInfo });

  const stepNodes: xyflowNode[] = sortedSteps.map((step, index) => {
    const stepKey = Object.keys(nodesInfo).find(
      (key) => nodesInfo[key] === step
    )!;
    const nodeId = idMap[stepKey];

    return {
      id: nodeId!,
      type: "default",
      data: {
        step: { ...step, __key: stepKey },
        label: (
          <StepNodeComponent
          isSubWorkflow={isSubWorkflow}
            mode="step"
            step={{ ...step, __key: stepKey }}
            color={color}
          />
        ),
      },
      position: {
        x: EDITOR_PADDING + NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN),
        y:
          /** Top padding and margin */
          EDITOR_PADDING +
          /** The input row */
          (NODE_HEIGHT + NODE_MARGIN + NODE_MARGIN) +
          /** Previous steps */
          index * (NODE_HEIGHT + NODE_MARGIN) +
          NODE_MARGIN,
      },
      draggable: !readOnly,
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        margin: "0px",
        padding: "0px",
        borderRadius: "6px",
        border: "1px solid rgba(0, 0, 0, 0.60)",
        boxShadow: "4px 4px 16px rgba(0, 0, 0, 0.05)",
        background: hexToRgba(color, 0.3),
      },
    } as xyflowNode<{step: WorkflowStep}>;
  });

  if (!readOnly) {
    const placeholderNode = {
      id: "__new_step_placeholder__",
      type: "default",
      data: {
        label: <StepNodeComponent mode="placeholder" color={color} isSubWorkflow={isSubWorkflow}/>,
      },
      position: {
        x: getMaxRight(stepNodes) + NODE_MARGIN,
        y: getMaxBottom(stepNodes) - NODE_HEIGHT,
      },
      style: {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        backgroundColor: hexToRgba(color, 0.2),
        borderStyle: "dashed",
        cursor: "pointer",
        margin: "0px",
        padding: "0px",
      },
    };

    stepNodes.push(placeholderNode);
  }

  if (isSubWorkflow) {
    const scale = 0.6;

    stepNodes.forEach((node) => {
      node.style = {
        ...node.style,
        width: NODE_WIDTH * scale,
        height: NODE_HEIGHT * scale,
      };

      node.position = {
        x: node.position.x * scale,
        y: node.position.y * scale,
      };
    });
  }

  return stepNodes;
};
