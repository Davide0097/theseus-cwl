import { Handle as H, HandleProps, Position } from "@xyflow/react";

import { Input } from "@theseus-cwl/types";

import { useCwlFileState } from "../../hooks";

const Handle_ = H as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<HandleProps & React.RefAttributes<Element>>
>;

export type InputNodeComponentProps =
  | { mode: "placeholder"; isSubWorkflow?: boolean }
  | {
      mode: "input";
      input: Input;
      isSubWorkflow?: boolean;
    };

export const InputNodeComponent = (props: InputNodeComponentProps) => {
  const { mode, isSubWorkflow } = props;

  const { addInput, colors } = useCwlFileState();

  if (mode === "input") {
    const { input } = props;
    const refeerToFile =
      (input && input.type === "File") || input.type === "Directory";

    return (
      <div className="input-node-card">
        <div className="input-node-card-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ backgroundColor: colors.input }}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
          <h1>{input.id}</h1>
        </div>
        {!isSubWorkflow && (
          <div
            className="input-node-card-badge"
            style={{ backgroundColor: colors.input }}
          >
            {input.type}
          </div>
        )}
        {!isSubWorkflow && (
          <div className="input-node-card-info">Input Parameter</div>
        )}
        {refeerToFile && (
          <div
            className="input-node-card-file-badge"
            style={{ backgroundColor: colors.input }}
          >
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="file"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0042 42h216v494z"></path>
            </svg>
          </div>
        )}
        <Handle_ type="source" id="bottom" position={Position.Bottom} />
      </div>
    );
  }

  if (mode === "placeholder") {
    return (
      <div onClick={addInput} className="node-component-placeholder">
        <span>+ New input node</span>
      </div>
    );
  }
};
