import { Edge, MarkerType } from "@xyflow/react";

export const getEdge = (
  source: string,
  target: string,
  type:
    | "input_to_step"
    | "step_to_step"
    | "step_to_output"
    | "worflow_to_worflow",
  labels: boolean,
  id?: string
): Edge => {
    // Determine source handle
  const sourceHandle =
    type === "worflow_to_worflow" ? "right" : "bottom";

  return {
    id: `${type}_edge_from_${source}_to_${target}_of_${id ?? "single_worflow"}`,
    source: source,
    target: target,   sourceHandle, 
    animated: true,
    label: labels ? `${source} → ${target}` : undefined,
    labelStyle: {
      background: "#f0f0f0",
      padding: "2px 6px",
      borderRadius: "8px",
      fontSize: "6px",
      fontWeight: 500,
      color: "#333",
      boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
    },
    type: type === "worflow_to_worflow" ? "step" : undefined,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: "rgba(0, 0, 0, 0.77)",
    },
    style: {
      strokeWidth: type !== "worflow_to_worflow" ? 1.8 : 0.5,
      stroke: "rgba(0, 0, 0, 0.77)",
    },
  };
};
