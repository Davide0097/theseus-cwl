import { useWorkflow } from "../../hooks";
import { Input } from "../cwl-editor";

export type InputNodeComponentProps = {
  input: Input | undefined;
};

export const InputNodeComponent = (props: InputNodeComponentProps) => {
  const { input } = props;
  const { addInput } = useWorkflow();

  if (input) {
    return (
      <div className="node-component">
        <h1 style={{ fontFamily: "monospace" }}>{input.key}</h1>
        <h1
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            marginTop: "7px",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {input.type}
        </h1>
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
