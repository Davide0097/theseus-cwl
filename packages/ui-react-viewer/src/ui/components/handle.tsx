import { Handle as H, HandleProps } from "@xyflow/react";

/** `@xyflow/react`'s Handle re-typed for React 19 JSX compatibility */
export const Handle_ = H as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<HandleProps & React.RefAttributes<Element>>
>;
