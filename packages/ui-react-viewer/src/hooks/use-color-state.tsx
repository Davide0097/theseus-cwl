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

/**
 * Reads the current default node colors. Computed on demand (not at module
 * load) so that a `configureTheseus({ INPUT_NODE_COLOR, ... })` override made
 * during app startup is reflected here.
 */
const getDefaultColors = (): ColorState => ({
  input: INPUT_NODE_COLOR,
  step: STEP_NODE_COLOR,
  output: OUTPUT_NODE_COLOR,
});

export type UserColorStateProps = {
  initialColorState?: ColorState;
};

export const useColorState = (props: UserColorStateProps) => {
  const { initialColorState } = props;

  const [colors, setColors] = useState<ColorState>(
    () => initialColorState || getDefaultColors(),
  );

  const setColorForType = (type: keyof ColorState, color: string) => {
    setColors((prev) => ({ ...prev, [type]: color }));
  };

  const resetColors = () => {
    const reset = initialColorState || getDefaultColors();
    setColors(reset);
  };

  return {
    colors,
    setColors,
    setColorForType,
    resetColors,
  };
};
