import { Output } from "@theseus-cwl/types";

import { useWorkflow } from "../../hooks";

export type OutputNodeComponentProps = {
  output?: Output;
  outputId?: string;
};

export const OutputNodeComponent = (props: OutputNodeComponentProps) => {
  const { output, outputId } = props;
  const { addOutput, colors } = useWorkflow();

  if (output) {
    return (
      <div className="node-component" style={{ backgroundColor: colors.output }}>
        <h1 style={{ fontFamily: "monospace" }}> {outputId}</h1>
        <h1>{output.type}</h1>
      </div>
    );
  }
  if (!output) {
    return (
      <div onClick={addOutput} className="node-component-placeholder">
        <span>+ New output node</span>
      </div>
    );
  }
};
