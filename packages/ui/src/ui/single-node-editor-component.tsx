import { Node as xyFlowNode } from "@xyflow/react";

import {
  InputNodeComponentProps,
  StepNodeComponentProps,
  OutputNodeComponentProps,
  OutputNodeForm,
  InputNodeForm,
  StepNodeForm,
} from "./components";
import { CWLWorkflow } from "./cwl-editor";

/**
 *
 */
export type SingleNodeEditorComponentProps = {
  node: xyFlowNode | null;
  cwlWorkflow: CWLWorkflow;
  setCwlWorkflow: React.Dispatch<React.SetStateAction<CWLWorkflow | null>>;
};

/**
 *
 */
export const SingleNodeEditorComponent = (
  props: SingleNodeEditorComponentProps
) => {
  const { node } = props;

  if (!node) return null;

  const nodeProps = node?.data?.label?.props!;

  if (!nodeProps) return null;

  const renderComponent = () => {
    if ("input" in nodeProps) {
      return (
        <InputNodeForm
          setCwlWorkflow={props.setCwlWorkflow}
          cwlWorkflow={props.cwlWorkflow}
          {...(nodeProps as InputNodeComponentProps)}
        />
      );
    } else if ("step" in nodeProps) {
      return <StepNodeForm stepProps={nodeProps as StepNodeComponentProps} />;
    } else if ("output" in nodeProps) {
      return (
        <OutputNodeForm outputProps={nodeProps as OutputNodeComponentProps} />
      );
    } else {
      return <div>No editable data</div>;
    }
  };

  return (
    <div
      style={{
        width: "30%",
        height: "100%",
        overflow: "auto",
        backgroundColor: "white",
        padding: "20px 10px",
        borderLeft: "1px solid black",
        color: "black",
      }}
    >
      {renderComponent()}
    </div>
  );
};
