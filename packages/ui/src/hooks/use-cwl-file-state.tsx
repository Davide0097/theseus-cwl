import { useContext } from "react";

import { CwlFileContext } from "../context";

export const useCwlFileState = () => {
  const context = useContext(CwlFileContext);
  if (!context)
    throw new Error("'useCwlFileState' must be used within a CwlFileProvider");
  return context;
};
