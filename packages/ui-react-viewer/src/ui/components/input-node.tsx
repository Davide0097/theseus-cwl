import { Position } from "@xyflow/react";

import { Input, Type } from "@theseus-cwl/types";

import { useCwlFileState } from "../../hooks";
import { Handle_ } from "./handle";
import { InputIcon } from "./icons";

const isFileType = (type: Type) =>
  type.startsWith("File") || type.startsWith("Directory");

export type InputNodeComponentProps =
  | { mode: "placeholder"; isSubWorkflow?: boolean }
  | {
      mode: "input";
      input: Input;
      isSubWorkflow?: boolean;
    };

export const InputNodeComponent = (props: InputNodeComponentProps) => {
  const { mode, isSubWorkflow } = props;

  const { colors, addInput } = useCwlFileState();

  if (mode === "input") {
    const { input } = props;
    const refersToFile = Array.isArray(input.type)
      ? input.type.some(isFileType)
      : isFileType(input.type);

    return (
      <div className="input-node-card">
        <div className="input-node-card-header">
          <InputIcon color={colors.input} />
          <h1>{input.id}</h1>
        </div>
        <div
          className="input-node-card-badge"
          style={{ backgroundColor: colors.input }}
        >
          {input.type}
        </div>
        {!isSubWorkflow && (
          <div className="input-node-card-info">Input Parameter</div>
        )}
        {refersToFile && (
          <div
            className="input-node-card-file-badge"
            style={{
              backgroundColor: `var(--cwl-viewer-node-file-badge-bg, ${colors.input})`,
            }}
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
