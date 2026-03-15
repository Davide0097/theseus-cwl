import { Shape, WorkflowStep, WorkflowStepInput } from "@theseus-cwl/types";

export const normalizeStepsIn = (
  stepIn: WorkflowStep<Shape.Raw | Shape.Raw>["in"],
): Record<string, WorkflowStepInput> => {
  const normalized: Record<string, WorkflowStepInput> = {};

  Object.entries(stepIn).forEach(([stepInKey, stepIn]) => {
    if (stepIn && typeof stepIn === "string") {
      normalized[stepInKey] = { source: stepIn };
    } else if (stepIn && typeof stepIn === "object") {
      normalized[stepInKey] = stepIn;
    }
  });

  return normalized;
};
