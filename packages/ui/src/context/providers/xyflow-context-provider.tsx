import { ReactFlowProvider } from "@xyflow/react";

import { CwlViewerWorkflow, CwlViewerWorkflowProps } from "../../ui";

export const XyflowContextProvider = (props: CwlViewerWorkflowProps) => (
  <ReactFlowProvider>
    <CwlViewerWorkflow {...props} />
  </ReactFlowProvider>
);
