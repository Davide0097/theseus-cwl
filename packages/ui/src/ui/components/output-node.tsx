import { Output } from "../cwl-editor";

 

/**
 *
 */
export type OutputNodeComponentProps = {
  output?: Output;
  outputId?: string;
  onAddOutputNode?: () => void;
};

/**
 *
 */
export const OutputNodeComponent = (props: OutputNodeComponentProps) => {
  const { output, outputId, onAddOutputNode } = props;

  if (output && !onAddOutputNode) {
    return (
      <div className="node-component ">
        <h1 style={{ fontFamily: "monospace" }}> {outputId}</h1>
        <h1
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            marginTop: "7px",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {output.type}
        </h1>
      </div>
    );
  }
  if (!output && onAddOutputNode) {
    return (
      <div onClick={onAddOutputNode} className="node-component-placeholder">
        <span>+ New output node</span>
      </div>
    );
  }
};
