import {
  CwlNodeData,
  InputNodeForm,
  OutputNodeForm,
  StepNodeForm,
} from "./components";

export type CwlViewerNodeInspectorProps = {
  nodeProps: CwlNodeData;
  readOnly: boolean;
};

export const CwlViewerNodeInspector = (props: CwlViewerNodeInspectorProps) => {
  const { nodeProps, readOnly } = props;

  if (!nodeProps) {
    return null;
  }

  const Form = nodeProps.input ? (
    <InputNodeForm input={nodeProps.input} readOnly={readOnly} />
  ) : nodeProps.step ? (
    <StepNodeForm step={nodeProps.step} readOnly={readOnly} />
  ) : nodeProps.output ? (
    <OutputNodeForm output={nodeProps.output} readOnly={readOnly} />
  ) : null;

  if (!Form) {
    return null;
  }

  return <div className="cwl-viewer-node-inspector">{Form}</div>;
};
