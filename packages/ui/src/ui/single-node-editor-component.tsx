import { Node as xyFlowNode } from "@xyflow/react";

import {
  InputNodeComponentProps,
  StepNodeComponentProps,
  OutputNodeForm,
  InputNodeForm,
  StepNodeForm,
  OutputNodeFormProps,
} from "./components";

/**
 *
 */
export type SingleNodeEditorComponentProps = {
  node: xyFlowNode | null;
};

/**
 *
 */
export const SingleNodeEditorComponent = (
  props: SingleNodeEditorComponentProps
) => {
  const { node } = props;

  if (!node) return null;

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const nodeProps = (node?.data?.label as Record<string, never>)?.props!;

  if (!nodeProps) return null;

  const renderComponent = () => {
    if ("input" in nodeProps) {
      return <InputNodeForm {...(nodeProps as InputNodeComponentProps)} />;
    } else if ("step" in nodeProps) {
      return <StepNodeForm step={(nodeProps as StepNodeComponentProps).step} />;
    } else if ("output" in nodeProps) {
      return (
        <OutputNodeForm output={(nodeProps as OutputNodeFormProps).output} />
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
