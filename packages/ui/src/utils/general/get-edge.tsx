import { Edge, MarkerType } from "@xyflow/react";

export const getId = (workflowId: string, key: string) => {
  return `${workflowId}-${key}`;
};

export type CwlEdgeType =
  | "input_to_step"
  | "step_to_step"
  | "step_to_output"
  | "workflow_to_workflow";

export type GetEdgeProps = {
  source: {
    workflowId: string;
    key: string;
  };
  target: {
    workflowId: string;
    key: string;
  };
  type: CwlEdgeType;
  hasLabel: boolean;
};

export const getEdge = (props: GetEdgeProps): Edge => {
  const { source, target, type, hasLabel } = props;

  const sourceId = getId(source.workflowId, source.key);
  const targetId = getId(target.workflowId, target.key);
  const sourceHandle = type === "workflow_to_workflow" ? "right" : "bottom";

  return {
    id: `${type}_edge_from_${sourceId}_to_${targetId}`,
    source: sourceId,
    target: targetId,
    sourceHandle: sourceHandle,
    animated: true,
    label: hasLabel ? `${sourceId} → ${targetId}` : undefined,
    labelStyle: {
      background: "#f0f0f0",
      padding: "2px 6px",
      borderRadius: "8px",
      fontSize: "6px",
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
      strokeWidth: type !== "workflow_to_workflow" ? 1.8 : 0.5,
      stroke: "rgba(0, 0, 0, 0.77)",
    },
  };
};
