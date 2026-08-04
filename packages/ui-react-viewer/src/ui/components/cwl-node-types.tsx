import {
  NodeProps,
  NodeTypes,
  Position,
  Node as xyFlowNode,
} from "@xyflow/react";
import { memo } from "react";

import { Input, WorkflowOutput, WorkflowStep } from "@theseus-cwl/types";

import { Handle_ } from "./handle";
import { InputNodeComponent } from "./input-node";
import { OutputNodeComponent } from "./output-node";
import { StepNodeComponent } from "./step-node";

/** The xyflow node `type` identifiers registered by the viewer. */
export enum CwlNodeType {
  INPUT = "input",
  STEP = "step",
  OUTPUT = "output",
  WRAPPER = "wrapper",
}

/**
 * The `data` payload the node initializers attach to every node.
 *
 * Exactly one of `input`/`step`/`output` is set for data nodes.
 */
export type CwlNodeData = {
  input?: Input;
  step?: WorkflowStep;
  output?: WorkflowOutput;
  label?: string;
  isSubWorkflow?: boolean;
};

export type CwlNodeProps = NodeProps<xyFlowNode<CwlNodeData>>;

const CwlInputNode = memo(function CwlInputNode(props: CwlNodeProps) {
  const { data, targetPosition } = props;

  return data.input ? (
    <>
      <Handle_ type="target" position={targetPosition ?? Position.Bottom} />
      <InputNodeComponent
        mode="input"
        input={data.input}
        isSubWorkflow={data.isSubWorkflow}
      />
    </>
  ) : (
    <InputNodeComponent mode="placeholder" />
  );
});

const CwlStepNode = memo(function CwlStepNode(props: CwlNodeProps) {
  const { data, targetPosition } = props;

  return data.step ? (
    <>
      <Handle_ type="target" position={targetPosition ?? Position.Top} />
      <StepNodeComponent
        mode="step"
        step={data.step}
        isSubWorkflow={data.isSubWorkflow ?? false}
      />
    </>
  ) : (
    <StepNodeComponent
      mode="placeholder"
      isSubWorkflow={data.isSubWorkflow ?? false}
    />
  );
});

const CwlOutputNode = memo(function CwlOutputNode(props: CwlNodeProps) {
  const { data, targetPosition } = props;

  return data.output ? (
    <>
      <Handle_ type="target" position={targetPosition ?? Position.Top} />
      <OutputNodeComponent
        mode="output"
        output={data.output}
        isSubWorkflow={data.isSubWorkflow}
      />
    </>
  ) : (
    <OutputNodeComponent
      mode="placeholder"
      isSubWorkflow={data.isSubWorkflow}
    />
  );
});

const CwlWrapperNode = memo(function CwlWrapperNode(props: CwlNodeProps) {
  const { data } = props;

  return <h1 className="wrapper-label">{data.label ?? ""}</h1>;
});

/**
 * The xyflow node types registered on the viewer's `<ReactFlow>`.
 *
 * Rendering nodes through registered types (instead of JSX baked into
 * `data.label`) keeps the node initializers in `src/utils` free of JSX and of
 * imports from `ui`, so utils stays a leaf layer with no import cycle.
 */
export const cwlNodeTypes: NodeTypes = {
  [CwlNodeType.INPUT]: CwlInputNode,
  [CwlNodeType.STEP]: CwlStepNode,
  [CwlNodeType.OUTPUT]: CwlOutputNode,
  [CwlNodeType.WRAPPER]: CwlWrapperNode,
};
