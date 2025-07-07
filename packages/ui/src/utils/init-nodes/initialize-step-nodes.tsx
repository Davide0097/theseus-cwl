import { Node as xyflowNode } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { StepNodeComponent } from "../../ui/components/step-node";
import {
  EDITOR_PADDING,
  NODE_HEIGHT,
  NODE_MARGIN,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";
import { CWLObject, CWLWorkflow } from "../../ui";
import { getWrapperNode } from "./get-wrapper-node";

export const initializeStepNodes = (
 cwlObject: CWLObject,

  addStep: (() => any) | undefined,
  colors?: Record<string, string>,
  inputNodes?: xyflowNode[],
  wrappers?: boolean
): xyflowNode[] => {
  let resultingNodes = [];

  const steps = cwlObject?.steps || [];
  const inputs = cwlObject?.inputs || [];

  const sortedSteps = [...steps].sort((stepA, stepB) => {
    const getInputOrder = (step: typeof stepA) => {
      const inputIds = Object.values(step.content.in || {})
        .map((input) => input.source || "")
        .map((source) => source.split("/")[0]);
      const firstInputIndex = inputIds
        .map((id) => Object.keys(inputs).findIndex((input) => input === id))
        .filter((i) => i >= 0)
        .sort((a, b) => a - b)[0];
      return firstInputIndex ?? Number.MAX_SAFE_INTEGER;
    };

    return getInputOrder(stepA) - getInputOrder(stepB);
  });

  const nodes: xyflowNode[] = sortedSteps.map((step, index) => ({
    id: step.id,
    type: "default",
    data: { label: <StepNodeComponent step={step} /> },
    position: {
      x: EDITOR_PADDING + NODE_MARGIN + index * (NODE_WIDTH + NODE_MARGIN),
      y:
        NODE_HEIGHT +
        NODE_MARGIN * 2 +
        index * (NODE_HEIGHT + EDITOR_PADDING) +
        EDITOR_PADDING,
    },
    style: {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      backgroundColor: colors?.steps,
    },
  }));

  const maxXPosition = nodes.reduce((max, node) => {
    return node.position.x > max ? node.position.x : max;
  }, 0);

  const placeholderNode = {
    id: "__new_step_placeholder__",
    type: "default",
    data: {
      label: <StepNodeComponent onAddStepNode={addStep} />,
    },
    position: {
      x: maxXPosition + NODE_WIDTH + NODE_MARGIN,
      y: Math.max(...nodes.map((n) => n.position.y)),
    },
    style: {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      opacity: 0.5,
      borderStyle: "dashed",
      cursor: "pointer",
    },
  };

  resultingNodes = [...nodes, placeholderNode];

  if (wrappers) {
    const wrapperNode = getWrapperNode([...nodes, placeholderNode]);
    resultingNodes.push(wrapperNode);
  }

  

  return resultingNodes;
};
