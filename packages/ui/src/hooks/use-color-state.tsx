import { useState, useEffect } from "react";

import {
  INPUT_NODE_COLOR,
  STEP_NODE_COLOR,
  OUTPUT_NODE_COLOR,
} from "@theseus-cwl/configurations";

export type ColorState = {
  input: string;
  steps: string;
  output: string;
  default: string;
};

const defaultColors: ColorState = {
  input: INPUT_NODE_COLOR,
  steps: STEP_NODE_COLOR,
  output: OUTPUT_NODE_COLOR,
  default: "#ff0072",
};

export type UserColorStateProps = {
  initialColorState?: ColorState;
  onColorChange?: (newDefault: string) => void;
};

export const useColorState = (props: UserColorStateProps = {}) => {
  const { initialColorState, onColorChange } = props;

  const [colors, setColors] = useState<ColorState>(
    initialColorState || defaultColors
  );

  const [pendingDefaultColor, setPendingDefaultColor] = useState(
    colors.default
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (pendingDefaultColor !== colors.default) {
        setColors((prev) => ({
          ...prev,
          default: pendingDefaultColor,
        }));
        onColorChange?.(pendingDefaultColor);
      }
    }, 900); // debounce time

    return () => clearTimeout(timeout);
  }, [colors.default, onColorChange, pendingDefaultColor]);

  const setColorForType = (type: keyof ColorState, color: string) => {
    setColors((prev) => ({ ...prev, [type]: color }));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingDefaultColor(e.target.value);
  };

  const resetColors = () => {
    const reset = initialColorState || defaultColors;
    setColors(reset);
    setPendingDefaultColor(reset.default);
  };

  return {
    colors,
    setColors,
    setColorForType,
    resetColors,
    onChange,
    pendingDefaultColor,
  };
};
