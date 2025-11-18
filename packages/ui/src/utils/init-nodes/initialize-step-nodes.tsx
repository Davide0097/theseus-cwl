import { Node as xyflowNode } from "@xyflow/react";
import { ReactElement } from "react";

import {
  EDITOR_PADDING,
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";
import { WorkflowStep } from "@theseus-cwl/types";

import { StepNodeComponent } from "../../ui";
import { getId, getMaxBottom, getMaxRight, hexToRgba } from "../general";
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
export const topologicalSortSteps = (steps: Record<string, WorkflowStep>) => {
  const visited = new Set<string>();
  const sorted: string[] = [];

  const visit = (key: string) => {
    if (visited.has(key)) return;
    visited.add(key);

    const step = steps[key];
    const inputs = Object.values(step?.in || {});

    const sources = inputs
      .flatMap((input) => {
        const src = input.source;
        if (!src) {
          return [];
        }

        return Array.isArray(src) ? src : [src];
      })
      .map((src) => src.split("/")[0])
      .filter((src) => src && steps[src]);

    for (const dep of sources) {
      if (dep) visit(dep);
    }

    sorted.push(key);
  };

  Object.keys(steps).forEach(visit);
  return sorted.map((key) => steps[key]);
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
 * Takes CWL output information as {@link Steps} and
 * reuturns an array of {@link xyFlowNode} objects that xyFlow uses to render the step nodes.
 */
export const initializeStepNodes = (
  props: InitializeStepsProps,
): xyflowNode<{ label?: ReactElement; step?: WorkflowStep }>[] => {
  const { nodesInfo, color, readOnly, isSubWorkflow, cwlFile } = props;

  const sortedSteps = topologicalSortSteps(nodesInfo);

  const stepNodes: xyflowNode[] = sortedSteps.map((step, index) => {
    const stepKey = Object.keys(nodesInfo).find(
      (key) => nodesInfo[key] === step,
    )!;

    return {
      id: getId(cwlFile?.id, stepKey),
      type: "default",
      data: {
        step: step,
        label: (
          <StepNodeComponent
            isSubWorkflow={isSubWorkflow}
            mode="step"
            step={step}
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
    } as xyflowNode<{ step: WorkflowStep }>;
  });

  if (!readOnly) {
    const placeholderNode = {
      id: "__new_step_placeholder__",
      type: "default",
      data: {
        label: (
          <StepNodeComponent mode="placeholder" isSubWorkflow={isSubWorkflow} />
        ),
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

  return stepNodes;
};
