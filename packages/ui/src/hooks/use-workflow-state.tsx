import { useContext } from "react";

import { CwlObjectContext } from "../context";

export const useWorkflowState = () => {
  const context = useContext(CwlObjectContext);
  if (!context)
    throw new Error("useWorkflowState must be used within a WorkflowProvider");
  return context;
};
