import { CwlSource, Shape } from "@theseus-cwl/types";

export const object: CwlSource<Shape.Raw> = {
  entrypoint: "example.cwl",
  documents: [
    {
      name: "example.cwl",
      content: {
        cwlVersion: "v1.2",
        entryPoint: "example-workflow",
        $graph: [
          {
            class: "Workflow",
            label: "Example Workflow",
            doc: "Dummy workflow for testing",
            id: "example-workflow",
            inputs: {
              input_string: {
                doc: "Example string input",
                label: "input_string",
                type: "string",
              },
              input_duration: {
                doc: "Example duration",
                label: "input_duration",
                type: "string",
              },
              input_dir_a: {
                doc: "Example directory A",
                label: "input_dir_a",
                type: "Directory",
              },
              input_dir_b: {
                doc: "Example directory B",
                label: "input_dir_b",
                type: "Directory",
              },
              optional_dir: {
                doc: "Optional directory",
                label: "optional_dir",
                type: "Directory?",
              },
              log_level: {
                doc: "Logging level",
                type: "string",
              },
            },
            outputs: {
              out: {
                type: "Directory",
                outputSource: "step1/result",
              },
            },
            steps: {
              step1: {
                run: "main",
                in: {
                  input_string: "input_string",
                  input_duration: "input_duration",
                  input_dir_a: "input_dir_a",
                  input_dir_b: "input_dir_b",
                  optional_dir: "optional_dir",
                  log_level: "log_level",
                },
                out: ["result"],
              },
            },
          },
          {
            class: "CommandLineTool",
            id: "main",
            requirements: {
              ResourceRequirement: {
                ramMin: 1024,
                coresMin: 1,
              },
              InitialWorkDirRequirement: {
                listing: [
                  {
                    class: "Directory",
                    location: "example-data-a",
                    basename: "data/a",
                  },
                  {
                    class: "Directory",
                    location: "example-data-b",
                    basename: "data/b",
                  },
                ],
              },
              DockerRequirement: {
                dockerPull: "example/image:latest",
              },
              NetworkAccess: {
                networkAccess: false,
              },
              EnvVarRequirement: {
                envDef: {
                  PATH: "/usr/local/bin:/usr/bin:/bin",
                },
              },
            },
            baseCommand: "/bin/example.sh",
            inputs: {
              input_string: {
                label: "String input",
                type: "string",
                default: "dummy-value",
                inputBinding: { position: 1, prefix: "--input_string" },
              },
              input_duration: {
                label: "Duration",
                type: "string",
                inputBinding: { position: 2, prefix: "--duration" },
              },
              input_dir_a: {
                label: "Directory A",
                type: "Directory",
                inputBinding: { position: 3, prefix: "--dir_a" },
              },
              input_dir_b: {
                label: "Directory B",
                type: "Directory",
                inputBinding: { position: 4, prefix: "--dir_b" },
              },
              optional_dir: {
                label: "Optional directory",
                type: "Directory?",
                inputBinding: { position: 5, prefix: "--optional_dir" },
              },
              log_level: {
                type: "string",
                label: "Log level",
                default: "INFO",
                inputBinding: { position: 6, prefix: "--log_level" },
              },
            },
            outputs: {
              result: {
                outputBinding: { glob: "./output/" },
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
  entrypoint: "example.cwl",
  documents: [
    {
      name: "example.cwl",
      content: `cwlVersion: v1.2
entryPoint: example-workflow
$graph:
  - class: Workflow
    label: Example Workflow
    doc: Dummy workflow for testing
    id: example-workflow

    inputs:
      input_string:
        doc: Example string input
        label: input_string
        type: string

      input_duration:
        doc: Example duration
        label: input_duration
        type: string

      input_dir_a:
        doc: Example directory A
        label: input_dir_a
        type: Directory

      input_dir_b:
        doc: Example directory B
        label: input_dir_b
        type: Directory

      optional_dir:
        doc: Optional directory
        label: optional_dir
        type: Directory?

      log_level:
        doc: Logging level
        type: string

    outputs:
      out:
        type: Directory
        outputSource: step1/result

    steps:
      step1:
        run: "main"
        in:
          input_string: input_string
          input_duration: input_duration
          input_dir_a: input_dir_a
          input_dir_b: input_dir_b
          optional_dir: optional_dir
          log_level: log_level
        out:
          - result

  - class: CommandLineTool
    id: main

    requirements:
      ResourceRequirement:
        ramMin: 1024
        coresMin: 1

      InitialWorkDirRequirement:
        listing:
          - class: Directory
            location: example-data-a
            basename: data/a
          - class: Directory
            location: example-data-b
            basename: data/b

      DockerRequirement:
        dockerPull: example/image:latest

      NetworkAccess:
        networkAccess: false

      EnvVarRequirement:
        envDef:
          PATH: /usr/local/bin:/usr/bin:/bin

    baseCommand: /bin/example.sh

    inputs:
      input_string:
        label: String input
        type: string
        default: dummy-value
        inputBinding:
          position: 1
          prefix: --input_string

      input_duration:
        label: Duration
        type: string
        inputBinding:
          position: 2
          prefix: --duration

      input_dir_a:
        label: Directory A
        type: Directory
        inputBinding:
          position: 3
          prefix: --dir_a

      input_dir_b:
        label: Directory B
        type: Directory
        inputBinding:
          position: 4
          prefix: --dir_b

      optional_dir:
        label: Optional directory
        type: Directory?
        inputBinding:
          position: 5
          prefix: --optional_dir

      log_level:
        type: string
        label: Log level
        default: INFO
        inputBinding:
          position: 6
          prefix: --log_level

    outputs:
      result:
        outputBinding:
          glob: ./output/
        type: Directory
`,
    },
  ],
  parameters: [],
};

export const source8 = { object, string };
