import { Node as xyflowNode } from "@xyflow/react";

import {
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
  VIEWER_PADDING,
} from "@theseus-cwl/configurations";
import { WorkflowStep } from "@theseus-cwl/types";

import { CwlNodeData, CwlNodeType } from "../../ui";
import {
  getId,
  getMaxBottom,
  getMaxRight,
  getNodeStyle,
  getPlaceholderNodeStyle,
  getSourceKeys,
} from "../general";
import { BaseInitializeNodeProps } from "./initialize-input-nodes";

export type SortStepsByDependenciesConfig = {
  steps: Record<string, WorkflowStep>;
};

/**
 * Topologically sorts the steps of a CWL workflow by their step-to-step
 * dependencies (a DFS post-order traversal of the dependency graph).
 *
 * Only `in.source` references that resolve to another step are treated as
 * dependencies - references to workflow-level inputs are ignored, since
 * input nodes are laid out separately. Steps with no step dependencies keep
 * their declaration order.
 */
export const sortStepsByDependencies = (
  props: SortStepsByDependenciesConfig,
) => {
  const { steps } = props;
  const visited = new Set<string>();
  const sorted: string[] = [];

  const visit = (key: string) => {
    if (visited.has(key)) {
      return;
    }
    visited.add(key);

    const step = steps[key];
    const dependencies = Object.values(step?.in || {}).flatMap((input) =>
      getSourceKeys(input.source).filter((sourceKey) => steps[sourceKey]),
    );

    for (const dependency of dependencies) {
      visit(dependency);
    }

    sorted.push(key);
  };

  Object.keys(steps).forEach(visit);

  return sorted;
};

/**
 * Props for {@link initializeStepNodes}
 */
export type InitializeStepsProps = BaseInitializeNodeProps & {
  nodesInfo: Record<string, WorkflowStep>;
};

/**
 * Initializes step nodes.
 *
 * Takes CWL step information and returns the {@link xyflowNode} objects that
 * xyFlow uses to render the step nodes.
 */
export const initializeStepNodes = (
  props: InitializeStepsProps,
): xyflowNode<CwlNodeData>[] => {
  const { nodesInfo, color, readOnly, isSubWorkflow, cwlFile } = props;

  const sortedStepKeys = sortStepsByDependencies({
    steps: nodesInfo,
  });

  const stepNodes: xyflowNode<CwlNodeData>[] = sortedStepKeys.map(
    (stepKey, index) => {
      const step = nodesInfo[stepKey]!;

      return {
        id: getId(cwlFile.id, stepKey),
        type: CwlNodeType.STEP,
        data: { step, isSubWorkflow },
        position: {
          x: VIEWER_PADDING + NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN),
          y:
            /** Top padding and margin */
            VIEWER_PADDING +
            /** The input row */
            (NODE_HEIGHT + NODE_MARGIN + NODE_MARGIN) +
            /** Previous steps */
            index * (NODE_HEIGHT + NODE_MARGIN) +
            NODE_MARGIN,
        },
        draggable: !readOnly,
        style: getNodeStyle(color),
      };
    },
  );

  if (!readOnly) {
    stepNodes.push({
      id: getId(cwlFile.id, "__new_step_placeholder__"),
      type: CwlNodeType.STEP,
      data: { isSubWorkflow },
      position: {
        x: getMaxRight(stepNodes) + NODE_MARGIN,
        y: getMaxBottom(stepNodes) - NODE_HEIGHT,
      },
      style: getPlaceholderNodeStyle(color),
    });
  }

  return stepNodes;
};
