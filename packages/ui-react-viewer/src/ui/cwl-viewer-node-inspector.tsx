import { ReactNode } from "react";

import { Input, WorkflowOutput, WorkflowStep } from "@theseus-cwl/types";

import { InputNodeForm, OutputNodeForm, StepNodeForm } from "./components";

export type CwlViewerNodeInspectorProps = {
  nodeProps: {
    label?: ReactNode;
    input?: Input;
    step?: WorkflowStep;
    output?: WorkflowOutput;
  };
  readOnly: boolean;
};

export const CwlViewerNodeInspector = (props: CwlViewerNodeInspectorProps) => {
  const { nodeProps, readOnly } = props;

  if (!nodeProps) {
    return null;
  }

  const renderComponent = () => {
    if (nodeProps.input) {
      return <InputNodeForm input={nodeProps.input} readOnly={readOnly} />;
    } else if (nodeProps.step) {
      return <StepNodeForm step={nodeProps.step} readOnly={readOnly} />;
    } else if (nodeProps.output) {
      return <OutputNodeForm output={nodeProps.output} readOnly={readOnly} />;
    }
  };

  return <div className="cwl-viewer-node-inspector">{renderComponent()}</div>;
};
