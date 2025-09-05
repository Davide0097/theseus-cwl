import { Step } from "@theseus-cwl/types";

export const normalizeStepsIn = (
  stepIn: Step["in"]
): Record<string, { source: string }> => {
  const normalized: Record<string, { source: string }> = {};

  Object.entries(stepIn).forEach(([stepInKey, stepIn]) => {
    if (stepIn && typeof stepIn === "string") {
      normalized[stepInKey] = { source: stepIn };
    } else if (stepIn && typeof stepIn === "object") {
      normalized[stepInKey] = stepIn;
    }
  });

  return normalized;
};
