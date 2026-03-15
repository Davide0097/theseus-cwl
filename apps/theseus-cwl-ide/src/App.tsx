import { useEffect, useState } from "react";

import { CWLSourceHolder } from "@theseus-cwl/parser";
import { CwlSource } from "@theseus-cwl/types";

import { CwlIdeComponent } from "./components";
import { CWLIde } from "./store";

export const PLACEHOLDER_DOCUMENT_FILE = `cwlVersion: v1.2
class: Workflow
label: File input example
requirements:
  InlineJavascriptRequirement: {}
inputs:
  input_file: 
    id: input_file
    type: File
  message: string

outputs:
  output:
    type: File
    outputSource: echo_step/output

steps:
  echo_step:
    run:
      cwlVersion: v1.2
      class: CommandLineTool
      baseCommand: sh
      inputs:
        input_file:
          type: File
        message:
          type: string
      outputs:
        output:
          type: File
          outputBinding:
            glob: output.txt
      arguments:
        - valueFrom: "-c"
        - valueFrom: |
            cat $(inputs.input_file.path) > output.txt
            echo $(inputs.message) >> output.txt
      stdout: output.txt
    in:
      input_file: input_file
      message: message
    out: [output]
`;

export const PLACEHOLDER_PARAMETER_FILE = `{
  "input_file": {
    "class": "File",
    "path": "example.txt"
  },
  "message": "Hello from Theseus string input!"
}`;

export const PLACEHOLDER_CWL_IDE_SOURCE = {
  entrypoint: "document.cwl",
  documents: [
    {
      name: "document.cwl",
      content: PLACEHOLDER_DOCUMENT_FILE,
    },
  ],
  parameters: [
    {
      name: "parameter.json",
      content: PLACEHOLDER_PARAMETER_FILE,
    },
    {
      name: "example.txt",
      content: "Hello from example.txt file",
    },
  ],
};

export const App = () => {
  const [source, setSource] = useState<CwlSource | undefined>(undefined);

  useEffect(() => {
    const sourceSetter = async () => {
      //@ts-expect-error source has just one document
      CWLSourceHolder.create(PLACEHOLDER_CWL_IDE_SOURCE).then(
        (sourceHolder) => {
          setSource(sourceHolder.source);
        },
      );
    };
    sourceSetter();
  }, []);

  if (!source) {
    return null;
  }

  return (
    <CwlIdeComponent
      ide={
        new CWLIde({
          source: source,
          options: {
            editor: {},
            viewer: {},
          },
        })
      }
    />
  );
};
