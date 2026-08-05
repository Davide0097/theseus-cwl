import { CwlSource, Shape } from "@theseus-cwl/types";

export const object: CwlSource<Shape.Raw> = {
  entrypoint: "document.cwl",
  documents: [
    {
      name: "document.cwl",
      content: {
        cwlVersion: "v1.2",
        $graph: [
          {
            class: "Workflow",
            label: "SwiftMover StageIn StageOut CWL",
            doc: "This CWL creates a service that refers to a basic StageIn+StageOut SwiftMover",
            id: "SwiftMover-CWL-7291-01",
            inputs: {
              data: {
                doc: "Directory to relocate",
                label: "DATA",
                type: "Directory",
              },
            },
            outputs: {
              result: {
                type: "Directory",
                outputSource: "relocate/result",
              },
            },
            steps: {
              relocate: {
                run: "#main",
                in: { data: "data" },
                out: ["result"],
              },
            },
          },
          {
            class: "CommandLineTool",
            id: "main",
            requirements: {
              DockerRequirement: {
                dockerPull: "demoregistry/swiftmoverstageinout:latest",
              },
              NetworkAccess: {
                networkAccess: true,
              },
              EnvVarRequirement: {
                envDef: {
                  PATH: "/opt/tools/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                },
              },
            },
            baseCommand: "/home/runner/processor/execute.sh",
            inputs: {
              data: {
                type: "Directory",
                inputBinding: {
                  position: 1,
                },
              },
            },
            outputs: {
              result: {
                outputBinding: {
                  glob: "./resultDir/result",
                },
                type: "Directory",
              },
            },
          },
        ],
      },
    },
  ],
  parameters: [],
};

export const string: CwlSource<Shape.Raw> = {
  entrypoint: "document.cwl",
  documents: [
    {
      name: "document.cwl",
      content: `cwlVersion: v1.2
$graph:
- class: Workflow
  label: SwiftMover StageIn StageOut CWL
  doc: This CWL creates a service that refers to a basic StageIn+StageOut SwiftMover
  id: SwiftMover-CWL-7291-01
  inputs:
    data:
      doc: Directory to relocate
      label: DATA
      type: Directory

  outputs:
    result:
      type: Directory
      outputSource: relocate/result
  steps:
    relocate:
      run: '#main'
      in:
        data: data
      out:
      - result
- class: CommandLineTool
  id: main
  requirements:
    DockerRequirement:
      dockerPull: demoregistry/swiftmoverstageinout:latest
    NetworkAccess:
      networkAccess: true
    EnvVarRequirement:
      envDef:
        PATH: /opt/tools/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
  baseCommand: /home/runner/processor/execute.sh
  inputs:
    data:
      type: Directory
      inputBinding:
        position: 1

  outputs:
    result:
      outputBinding:
        glob: ./resultDir/result
      type: Directory
`,
    },
  ],
  parameters: [],
};

export const source10 = { object, string };
