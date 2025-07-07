import { ReactFlowProvider } from "@xyflow/react";

import { EditorComponentProps, FlowEditorComponent } from "../../ui";

export const XyflowContextProvider = (props: EditorComponentProps) => (
  <ReactFlowProvider>
    <FlowEditorComponent {...props} />
  </ReactFlowProvider>
);
