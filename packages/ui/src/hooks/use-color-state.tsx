import { useState } from "react";

import {
  INPUT_NODE_COLOR,
  OUTPUT_NODE_COLOR,
  STEP_NODE_COLOR,
} from "@theseus-cwl/configurations";

export type ColorState = {
  input: string;
  steps: string;
  output: string;
  default: string;
};

export const useColorState = () => {
  const [colors, setColors] = useState<ColorState>({
    input: INPUT_NODE_COLOR,
    steps: STEP_NODE_COLOR,
    output: OUTPUT_NODE_COLOR,
    default: "#ff0072",
  });

  return [colors, setColors];
};
