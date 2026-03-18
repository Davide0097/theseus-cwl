import { Edge } from "@xyflow/react";

import { isPackedDocument, isWorkflow } from "@theseus-cwl/parser";
import { CWLPackedDocument, Process, Workflow } from "@theseus-cwl/types";

import { getMainWorkflow } from "../general";
import {
  initializeInputToStepEdges,
  initializeProcessInputToOutputEdges,
} from "./initialize-inputs-to-steps-edges";
import { initializeMainStepToSubworkflowInputEdges } from "./initialize-main-steps-to-subworkflow-inputs-edges";
import { initializeStepToOutputEdges } from "./initialize-steps-to-outputs-edges";
import { initializeStepToStepEdges } from "./initialize-steps-to-steps-edges";

export const intializeSingleWorkflowEdges = (
  cwlFile: Workflow | Process,
  labels: boolean,
) => {
  if (!isWorkflow(cwlFile)) {
    const inputToOutputEdges = initializeProcessInputToOutputEdges(
      cwlFile,
      labels,
    );

    return [...inputToOutputEdges];
  } else {
    const inputToStepEdges = initializeInputToStepEdges(cwlFile, labels);
    const stepToStepEdges = initializeStepToStepEdges(cwlFile, labels);
    const stepToOutputEdges = initializeStepToOutputEdges(cwlFile, labels);
    return [...inputToStepEdges, ...stepToStepEdges, ...stepToOutputEdges];
  }
};

/**
 * Initialize all the edges from the CWLFile object
 *
 * @param {Workflow | CWLPackedDocument} cwlFile
 *
 * @returns {Edge[]}
 */
export const initializeEdges = (
  cwlFile: Workflow | CWLPackedDocument | Process,
  labels: boolean,
): Edge[] => {
  if (!isPackedDocument(cwlFile)) {
    return intializeSingleWorkflowEdges(cwlFile, labels);
  } else {
    const allEdges: Edge[] = [];

    let mainWorkflow: undefined | Process | Workflow = getMainWorkflow(cwlFile);

    if (!mainWorkflow) {
      console.warn(
        "CWLViewer: Could not find a process with class workflow in the CWL packed document. " +
          "Ensure that the packed CWL document has a valid entrypoint or main process with class workflow defined.",
      );
      mainWorkflow = Object.values(cwlFile.$graph)[0];
    }

    if (!mainWorkflow) {
      return [];
    }

    Object.values(cwlFile.$graph).map((processOrWorkflow) => {
      if (!isWorkflow(processOrWorkflow)) {
        const inputToOutputEdges = initializeProcessInputToOutputEdges(
          processOrWorkflow,
          labels,
        );

        allEdges.push(...inputToOutputEdges);
      } else {
        const inputToStepEdges = initializeInputToStepEdges(
          processOrWorkflow,
          labels,
        );
        const stepToStepEdges = initializeStepToStepEdges(
          processOrWorkflow,
          labels,
        );
        const stepToOutputEdges = initializeStepToOutputEdges(
          processOrWorkflow,
          labels,
        );
        allEdges.push(
          ...inputToStepEdges,
          ...stepToStepEdges,
          ...stepToOutputEdges,
        );
      }
    });

    if (isWorkflow(mainWorkflow)) {
      const mainStepsToSubWorkflowInputEdges =
        initializeMainStepToSubworkflowInputEdges(
          mainWorkflow,
          cwlFile.$graph,
          labels,
        );

      allEdges.push(...mainStepsToSubWorkflowInputEdges);
    }

    return allEdges;
  }
};
