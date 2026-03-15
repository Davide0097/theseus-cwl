import { ReactFlowProvider } from "@xyflow/react";

import { CwlVisualMap, CwlVisualMapProps } from "../../ui";

export const XyflowContextProvider = (props: CwlVisualMapProps) => (
  <ReactFlowProvider>
    <CwlVisualMap {...props} />
  </ReactFlowProvider>
);
