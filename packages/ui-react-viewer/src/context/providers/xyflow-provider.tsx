import { ReactFlowProvider } from "@xyflow/react";

export type XyflowContextProviderProps = {
  children: React.ReactNode;
};

export const XyflowContextProvider = (props: XyflowContextProviderProps) => (
  <ReactFlowProvider>{props.children}</ReactFlowProvider>
);
