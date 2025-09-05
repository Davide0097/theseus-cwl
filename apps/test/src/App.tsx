import { CWLObject } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui";

import { useState } from "react";

const cwlObjects: CWLObject[] = [
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      tarball: "File",
      name_of_file_to_extract: "string",
    },
    outputs: {
      compiled_class: {
        type: "File",
        outputSource: "compile/classfile",
      },
    },
    steps: {
      untar: {
        run: "tar-param.cwl",
        in: {
          tarfile: "tarball",
          extractfile: "name_of_file_to_extract",
        },
        out: ["extracted_file"],
      },
      compile: {
        run: "arguments.cwl",
        in: {
          src: "untar/extracted_file",
        },
        out: ["classfile"],
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    requirements: {
      InlineJavascriptRequirement: {},
    },
    inputs: {
      message: "string",
    },
    outputs: {
      out: {
        type: "string",
        outputSource: "uppercase/uppercase_message",
      },
    },
    steps: {
      echo: {
        run: "echo.cwl",
        in: {
          message: "message",
        },
        out: ["out"],
      },
      uppercase: {
        run: "uppercase.cwl",
        in: {
          message: {
            source: "echo/out",
          },
        },
        out: ["uppercase_message"],
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      input_a: { type: "string" },
      input_b: { type: "string" },
      input_c: { type: "string" },
      input_list: { type: "string[]" },
      condition_flag: { type: "boolean" },
    },
    steps: {
      step1: {
        run: "tools/step1.cwl",
        in: {
          param_a: { source: "input_a" },
        },
        out: ["out1"],
      },
      step2: {
        run: "tools/step2.cwl",
        scatter: "param_b",
        in: {
          param_b: { source: "input_list" },
          dependency: { source: "step1/out1" },
        },
        out: ["out2"],
      },
      step3: {
        run: "tools/step3.cwl",
        in: {
          param_c: { source: "input_c" },
          dependency: { source: "step2/out2" },
        },
        out: ["out3"],
      },
      final: {
        run: "tools/finalize.cwl",
        in: {
          input: { source: "step3/out3" },
        },
        out: ["final_output"],
      },
    },
    outputs: {
      result: {
        type: "File",
        outputSource: "final/final_output",
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      input_files: {
        type: "File[]",
      },
      merge_strategy: {
        type: "string",
        default: "concat",
      },
    },
    steps: {
      preprocess: {
        run: "tools/preprocess.cwl",
        in: {
          file: { source: "input_files" },
        },
        out: ["processed_file"],
        scatter: "file",
      },
      merge: {
        run: "tools/merge.cwl",
        in: {
          files: { source: "preprocess/processed_file" },
          strategy: { source: "merge_strategy" },
        },
        out: ["merged_output"],
      },
    },
    outputs: {
      final_output: {
        type: "File",
        outputSource: "merge/merged_output",
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      input_a: { type: "string" },
      input_b: { type: "string" },
      input_c: { type: "string" },
    },
    steps: {
      step1: {
        run: "tools/step1.cwl",
        in: {
          param_a: { source: "input_a" },
        },
        out: ["out1"],
      },
      step2: {
        run: "tools/step2.cwl",
        in: {
          param_b: { source: "input_b" },
          dependency: { source: "step1/out1" },
        },
        out: ["out2"],
      },
      step3: {
        run: "tools/step3.cwl",
        in: {
          param_c: { source: "input_c" },
          dependency: { source: "step2/out2" },
        },
        out: ["out3"],
      },
      final: {
        run: "tools/finalize.cwl",
        in: {
          input: { source: "step3/out3" },
        },
        out: ["final_output"],
      },
    },
    outputs: {
      result: {
        type: "File",
        outputSource: "final/final_output",
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      search_string: {
        type: "string",
      },
      output_filename: {
        type: "string",
      },
      zip_file: {
        type: "File",
      },
    },
    steps: {
      grep: {
        __key: "grep",
        run: "../grep/grep.cwl",
        in: {
          extended: { default: true },
          search_file: { source: "untar/uncompress_file" },
          search_string: { source: "search_string" },
        },
        out: "occurences",
      },
      untar: {
        __key: "untar",
        run: "../tar/tar.cwl",
        in: {
          compress_file: { source: "zip_file" },
        },
        out: "uncompress_file",
      },

      wc: {
        __key: "wc",
        run: "../wc/wc.cwl",
        in: {
          input_file: { source: "grep/occurences" },
          output_filename: { source: "output_filename" },
        },
        out: ["count"],
      },
    },
    outputs: {
      occurences: {
        type: "string",
        outputSource: "wc/count",
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      pattern: {
        type: "File",
      },
      search_string: {
        type: "string",
      },
      output_filename: {
        type: "string",
      },
    },
    steps: {
      grep: {
        run: "grep.cwl",
        in: {
          pattern: { source: "pattern" },
        },
        out: "uncompress_file",
      },
      grep2: {
        run: "../grep/grep.cwl",
        in: {
          extended: { default: true },
          search_file: { source: "untar/uncompress_file" },
          search_string: { source: "search_string" },
        },
        out: "occurences",
      },
      id: {
        run: "../wc/wc.cwl",
        in: {
          input_file: { source: "grep/occurences" },
          output_filename: { source: "output_filename" },
        },
        out: ["count"],
      },
    },
    outputs: {
      occurrences: {
        type: "File",
        outputSource: "wc/count",
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      url_list: { type: "string" },
      search_pattern: { type: "string" },
      summary_filename: { type: "string", default: "summary.txt" },
    },
    steps: {
      download_files: {
        run: "../utils/download.cwl",
        in: {
          url: { source: "url_list" },
        },
        out: "downloaded_file",
        scatter: "url",
      },
      extract_archives: {
        run: "../utils/extract-tar-gz.cwl",
        in: {
          archive_file: { source: "download_files/downloaded_file" },
        },
        out: "extracted_folder",
        scatter: "archive_file",
      },
      search_each_folder: {
        run: "../utils/recursive-grep.cwl",
        in: {
          folder: { source: "extract_archives/extracted_folder" },
          pattern: { source: "search_pattern" },
        },
        out: "grep_results",
        scatter: "folder",
      },
      merge_results: {
        run: "../utils/combine-text-files.cwl",
        in: {
          input_files: { source: "search_each_folder/grep_results" },
          output_filename: { source: "summary_filename" },
        },
        out: "combined_output",
      },
    },
    outputs: {
      summary_report: {
        type: "File",
        outputSource: "merge_results/combined_output",
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    inputs: {
      num1: {
        type: "int",
      },
      num2: {
        type: "int",
      },
      multiplier: {
        type: "int",
      },
    },
    steps: {
      add: {
        run: "../math/add.cwl",
        in: {
          a: { source: "num1" },
          b: { source: "num2" },
        },
        out: "sum",
      },
      multiply: {
        run: "../math/multiply.cwl",
        in: {
          number: { source: "add/sum" },
          multiplier: { source: "multiplier" },
        },
        out: "result",
      },
    },
    outputs: {
      final_result: {
        type: "int",
        outputSource: "multiply/result",
      },
    },
  },
];

export const ExampleComponent = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [minimap, setMinimap] = useState<boolean>(false);
  const [wrappers, setWrappers] = useState<boolean>(false);
  const [labels, setLabels] = useState<boolean>(false);
  const [colorEditor, setColorEditor] = useState<boolean>(false);

  return (
    <div className="example">
      <div className="example-actions">
        <label>
          Input:
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
          >
            {cwlObjects.map((_, index) => (
              <option key={index} value={index}>
                CWL Object {index}
              </option>
            ))}
          </select>
        </label>

        <label>
          <input
            type="checkbox"
            checked={minimap}
            onChange={() => setMinimap(!minimap)}
          />
          Minimap
        </label>
        <label>
          <input
            type="checkbox"
            checked={labels}
            onChange={() => setLabels(!labels)}
          />
          Labels
        </label>
        <label>
          <input
            type="checkbox"
            checked={wrappers}
            onChange={() => setWrappers(!wrappers)}
          />
          Wrappers
        </label>
        <label>
          <input
            type="checkbox"
            checked={colorEditor}
            onChange={() => setColorEditor(!colorEditor)}
          />
          Color selector
        </label>
      </div>
      <CwlViewer
        input={cwlObjects[selectedIndex]}
        wrappers={wrappers}
        minimap={minimap}
        colorEditor={colorEditor}
        labels={labels}
      />
    </div>
  );
};

function App() {
  return <ExampleComponent />;
}

export default App;
