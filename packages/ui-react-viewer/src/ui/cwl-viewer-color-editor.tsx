import { useEffect, useMemo, useState } from "react";

import { useCwlFileState } from "../hooks";

export const CwlViewerColorEditor = () => {
  const { colors, setColors, resetColors, initialColors } = useCwlFileState();
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

  const canReset =
    colors.input !== initialColors.input ||
    colors.step !== initialColors.step ||
    colors.output !== initialColors.output;

  return (
    <div className="cwl-viewer-color-editor">
      {(["input", "step", "output"] as const).map((type) => (
        <input
          key={type}
          type="color"
          value={localColors[type]}
          onChange={(event) => handleLocalColorChange(type, event.target.value)}
        />
      ))}
      {(hasChanges || canReset) && (
        <div className="cwl-viewer-color-editor-buttons">
          {hasChanges && (
            <>
              <button onClick={applyColors}>Apply</button>
              <button onClick={handleCancel}>Cancel</button>
            </>
          )}
          {canReset && <button onClick={resetColors}>Reset to initial</button>}
        </div>
      )}
    </div>
  );
};
