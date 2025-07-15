import { useContext } from "react";

import { CwlObjectContext } from "../context";

export const useWorkflow = () => {
  const context = useContext(CwlObjectContext);
  if (!context)
    throw new Error("useWorkflow must be used within a WorkflowProvider");
  return context;
};
