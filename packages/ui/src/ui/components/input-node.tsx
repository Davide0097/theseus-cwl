import { Input } from "@theseus-cwl/types";

import { useWorkflow } from "../../hooks";

export type InputNodeComponentProps = {
  input?: Input;
};

export const InputNodeComponent = (props: InputNodeComponentProps) => {
  const { input } = props;

  const { addInput, colors } = useWorkflow();

  if (input) {
    return (
      <div className="node-component" style={{ backgroundColor: colors.input }}>
        <h1 style={{ fontFamily: "monospace" }}>{input.__key}</h1>
        <h1>{input.type}</h1>
      </div>
    );
  }
  if (!input) {
    return (
      <div onClick={addInput} className="node-component-placeholder">
        <span>+ New input node</span>
      </div>
    );
  }
};
