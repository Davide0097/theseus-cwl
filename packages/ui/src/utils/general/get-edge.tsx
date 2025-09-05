import { Edge, MarkerType } from "@xyflow/react";

export const getEdge = (
  source: string,
  target: string,
  type: "input_to_step" | "step_to_step" | "step_to_output",
  labels: boolean
): Edge => ({
  id: `${type}_edge_from_${source}_to_${target}`,
  source: source,
  target: target,
  animated: true,
  label: labels ? `${source} → ${target}` : undefined,
  labelStyle: {
    background: "#f0f0f0",
    padding: "2px 6px",
    borderRadius: "8px",
    fontSize: "9px",
    fontWeight: 500,
    color: "#333",
    boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: "rgba(0, 0, 0, 0.77)",
  },
  style: {
    strokeWidth: 1,
    stroke: "rgba(0, 0, 0, 0.77)",
  },
});
