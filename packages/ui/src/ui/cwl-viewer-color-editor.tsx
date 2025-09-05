import { useEffect, useMemo, useState } from "react";

import {
  INPUT_NODE_COLOR,
  OUTPUT_NODE_COLOR,
  STEP_NODE_COLOR,
} from "@theseus-cwl/configurations";

import { useWorkflowState } from "../hooks";

export const CwkViewerColorEditor = () => {
  const { colors, setColors, resetColors } = useWorkflowState();
  const [localColors, setLocalColors] = useState(colors);

  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  const handleLocalColorChange = (type: keyof typeof colors, value: string) => {
    setLocalColors((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const applyColors = () => {
    setColors(localColors);
  };

  const handleCancel = () => {
    setLocalColors(colors);
    setColors(colors);
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(localColors) !== JSON.stringify(colors);
  }, [localColors, colors]);

  return (
    <div className="cwl-viewer-color-editor">
      {(["input", "steps", "output"] as const).map((type) => (
        <input
          key={type}
          type="color"
          value={localColors[type]}
          onChange={(event) => handleLocalColorChange(type, event.target.value)}
        />
      ))}
      {hasChanges && (
        <div className="cwl-viewer-color-editor-buttons">
          <button
            onClick={applyColors}
            style={{
              background: "#111",
              color: "#fff",
            }}
          >
            Apply
          </button>
          <button onClick={handleCancel}>Cancel</button>
          {(colors.input !== INPUT_NODE_COLOR ||
            colors.steps !== STEP_NODE_COLOR ||
            colors.output !== OUTPUT_NODE_COLOR) && (
            <button onClick={resetColors}>Reset to initial</button>
          )}
        </div>
      )}
    </div>
  );
};
