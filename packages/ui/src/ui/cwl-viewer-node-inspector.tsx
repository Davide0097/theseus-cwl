import {
  InputNodeComponentProps,
  InputNodeForm,
  OutputNodeComponentProps,
  OutputNodeForm,
  StepNodeComponentProps,
  StepNodeForm,
} from "./components";

export type CwlViewerNodeInspectorProps = {
  nodeProps:
    | InputNodeComponentProps
    | StepNodeComponentProps
    | OutputNodeComponentProps
    | undefined;
  readOnly: boolean;
};

export const CwlViewerNodeInspector = (props: CwlViewerNodeInspectorProps) => {
  const { nodeProps, readOnly } = props;

  if (!nodeProps) {
    return null;
  }

  const renderComponent = () => {
    if ("input" in nodeProps) {
      return <InputNodeForm input={nodeProps.input} readOnly={readOnly} />;
    } else if ("step" in nodeProps) {
      return <StepNodeForm step={nodeProps.step} readOnly={readOnly} />;
    } else if ("output" in nodeProps) {
      return <OutputNodeForm output={nodeProps.output} readOnly={readOnly} />;
    }
  };

  return <div className="cwl-viewer-node-inspector">{renderComponent()}</div>;
};
