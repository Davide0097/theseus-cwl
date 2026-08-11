import { WorkflowOutput } from "@theseus-cwl/types";

import { useCwlFileState } from "../../hooks";
import { OutputIcon } from "./icons";

export type OutputNodeComponentProps =
  | { mode: "placeholder"; isSubWorkflow?: boolean }
  | {
      mode: "output";
      output: WorkflowOutput;
      isSubWorkflow?: boolean;
    };

export const OutputNodeComponent = (props: OutputNodeComponentProps) => {
  const { mode } = props;

  const { colors, addOutput } = useCwlFileState();

  if (mode === "output") {
    const { output } = props;

    return (
      <div className="output-node-card">
        <div className="output-node-card-header">
          <OutputIcon color={colors.output} />
          <h1>{output.id}</h1>
        </div>
        <div
          className="output-node-card-badge"
          style={{ backgroundColor: colors.output }}
        >
          {typeof output.type === "object"
            ? JSON.stringify(output.type)
            : output.type}
        </div>
      </div>
    );
  }

  if (mode === "placeholder") {
    return (
      <div onClick={addOutput} className="node-component-placeholder">
        <span>+ New output node</span>
      </div>
    );
  }
};
