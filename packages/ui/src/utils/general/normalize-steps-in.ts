import { WorkflowStep } from "@theseus-cwl/types";

export const normalizeStepsIn = (
  stepIn: WorkflowStep["in"]
): Record<string, { source?: string | string[] }> => {
  const normalized: Record<string, { source?: string | string[] }> = {};

  Object.entries(stepIn).forEach(([stepInKey, stepIn]) => {
    if (stepIn && typeof stepIn === "string") {
      normalized[stepInKey] = { source: stepIn };
    } else if (stepIn && typeof stepIn === "object") {
      normalized[stepInKey] = stepIn;
    }
  });

  return normalized;
};
