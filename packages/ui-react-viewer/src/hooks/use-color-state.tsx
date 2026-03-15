import { useState } from "react";

import {
  INPUT_NODE_COLOR,
  OUTPUT_NODE_COLOR,
  STEP_NODE_COLOR,
} from "@theseus-cwl/configurations";

export type ColorState = {
  input: string;
  step: string;
  output: string;
};

const defaultColors: ColorState = {
  input: INPUT_NODE_COLOR,
  step: STEP_NODE_COLOR,
  output: OUTPUT_NODE_COLOR,
};

export type UserColorStateProps = {
  initialColorState?: ColorState;
};

export const useColorState = (props: UserColorStateProps) => {
  const { initialColorState } = props;

  const [colors, setColors] = useState<ColorState>(
    initialColorState || defaultColors,
  );

  const setColorForType = (type: keyof ColorState, color: string) => {
    setColors((prev) => ({ ...prev, [type]: color }));
  };

  const resetColors = () => {
    const reset = initialColorState || defaultColors;
    setColors(reset);
  };

  return {
    colors,
    setColors,
    setColorForType,
    resetColors,
  };
};
