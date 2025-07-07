import { Edge, MarkerType } from "@xyflow/react";
import { useColorState } from "../../hooks";
import { CWLObject, CWLWorkflow } from "../../ui";

export const initializeEdgesStepToStepEdges = (
    cwlObject: CWLObject
): Edge[] => {
  const edges: Edge[] = [];

  cwlObject!.steps.forEach((step) => {
    const stepId = step.id;
    const stepInputs = step.content.in;

    Object.entries(stepInputs).forEach(([, inputValue]) => {
      if (inputValue.source) {
        const sourceStepId = inputValue.source.split("/")[0];

        edges.push({
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#4c8bf5",
          },
          id: `edge-${sourceStepId}-to-${stepId}`,
          source: sourceStepId,
          target: stepId,
          animated: true,
        });
      }
    });
  });

  return edges;
};
export const CwkWorflowFileComponent = ({ cwlWorkflow }) => {
  return (
    <p
      style={{
        position: "absolute",
        color: "black",
        top: "0",
        right: "200px",
        maxWidth: "200px",
      }}
    >
      {JSON.stringify(cwlWorkflow)}
    </p>
  );
};

export const CwkWorflowLegendEditor = ({ cwlWorkflow }) => {
  const [colors, setColors, nodeColor] = useColorState();

  return (
    <div
      style={{
        position: "absolute",
        color: "black",
        bottom: "0",
        right: "500px",
        width: "200px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div>
        <label>Input Node Color:</label>
        <input
          type="color"
          value={colors.input}
          onChange={(e) => setColors({ ...colors, input: e.target.value })}
        />
      </div>
      <div>
        <label>Output Node Color:</label>
        <input
          type="color"
          value={colors.output}
          onChange={(e) => setColors({ ...colors, output: e.target.value })}
        />
      </div>
      <div>
        <label>Default Node Color:</label>
        <input
          type="color"
          value={colors.default}
          onChange={(e) => setColors({ ...colors, default: e.target.value })}
        />
      </div>
    </div>
  );
};
