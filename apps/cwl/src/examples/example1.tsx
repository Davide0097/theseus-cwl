import { CWLObject } from "@theseus-cwl/types";
import { CwlEditor } from "@theseus-cwl/ui";

import { useState } from "react";

const cwlObjects: (CWLObject | undefined)[] = [
  {
    cwlVersion: "v1.0",
    class: "Workflow",
    inputs: {
      zip_file: {
        type: "File",
      },
      search_string: {
        type: "string",
      },
      output_filename: {
        type: "string",
      },
    },
    steps: [
      {
        id: "untar",
        content: {
          run: "../tar/tar.cwl",
          in: {
            compress_file: { source: "zip_file" },
          },
          out: "uncompress_file",
        },
      },
      {
        id: "grep",
        content: {
          run: "../grep/grep.cwl",
          in: {
            extended: { default: true },
            search_file: { source: "untar/uncompress_file" },
            search_string: { source: "search_string" },
          },
          out: "occurences",
        },
      },
      {
        id: "wc",
        content: {
          run: "../wc/wc.cwl",
          in: {
            input_file: { source: "grep/occurences" },
            output_filename: { source: "output_filename" },
          },
          out: ["count"],
        },
      },
    ],
    outputs: {
      occurences: {
        type: "string",
        outputSource: "wc/count",
      },
    },
  },
  {
    cwlVersion: "v1.0",
    class: "Workflow",
    inputs: {},
    steps: [],
    outputs: {},
  },
  {
    cwlVersion: "v1.0",
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
    steps: [
      {
        id: "grep",
        content: {
          run: "grep.cwl",
          in: {
            pattern: { source: "pattern" },
          },
          out: "uncompress_file",
        },
      },
      {
        id: "grep",
        content: {
          run: "../grep/grep.cwl",
          in: {
            extended: { default: true },
            search_file: { source: "untar/uncompress_file" },
            search_string: { source: "search_string" },
          },
          out: "occurences",
        },
      },
      {
        id: "wc",
        content: {
          run: "../wc/wc.cwl",
          in: {
            input_file: { source: "grep/occurences" },
            output_filename: { source: "output_filename" },
          },
          out: ["count"],
        },
      },
    ],
    outputs: {
      occurrences: {
        type: "File",
        outputSource: "wc/count",
      },
    },
  },
  {
    cwlVersion: "v1.0",
    class: "Workflow",
    inputs: {
      url_list: { type: "string" },
      search_pattern: { type: "string" },
      summary_filename: { type: "string", default: "summary.txt" },
    },
    steps: [
      {
        id: "download_files",
        content: {
          run: "../utils/download.cwl",
          in: {
            url: { source: "url_list" },
          },
          out: "downloaded_file",
          scatter: "url",
        },
      },
      {
        id: "extract_archives",
        content: {
          run: "../utils/extract-tar-gz.cwl",
          in: {
            archive_file: { source: "download_files/downloaded_file" },
          },
          out: "extracted_folder",
          scatter: "archive_file",
        },
      },
      {
        id: "search_each_folder",
        content: {
          run: "../utils/recursive-grep.cwl",
          in: {
            folder: { source: "extract_archives/extracted_folder" },
            pattern: { source: "search_pattern" },
          },
          out: "grep_results",
          scatter: "folder",
        },
      },
      {
        id: "merge_results",
        content: {
          run: "../utils/combine-text-files.cwl",
          in: {
            input_files: { source: "search_each_folder/grep_results" },
            output_filename: { source: "summary_filename" },
          },
          out: "combined_output",
        },
      },
    ],
    outputs: {
      summary_report: {
        type: "File",
        outputSource: "merge_results/combined_output",
      },
    },
  },
  {
    cwlVersion: "v1.0",
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
    steps: [
      {
        id: "add",
        content: {
          run: "../math/add.cwl",
          in: {
            a: { source: "num1" },
            b: { source: "num2" },
          },
          out: "sum",
        },
      },
      {
        id: "multiply",
        content: {
          run: "../math/multiply.cwl",
          in: {
            number: { source: "add/sum" },
            multiplier: { source: "multiplier" },
          },
          out: "result",
        },
      },
    ],
    outputs: {
      final_result: {
        type: "int",
        outputSource: "multiply/result",
      },
    },
  },
];

export const ExampleComponent = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [preview, setPreview] = useState(false);
  const [readonly, setReadonly] = useState(false);
  const [minimap, setMinimap] = useState(true);
  const [wrappers, setWrappers] = useState(true);

  const handleOnChange = (value: object) => {
    console.log(value);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "1rem",
          position: "absolute",
          zIndex: "9999999999",
        }}
      >
        <button onClick={() => setPreview(!preview)} style={{ marginLeft: 8 }}>
          Toggle Preview (Currently {preview ? "ON" : "OFF"})
        </button>
        <label style={{ marginRight: 8 }}>
          Choose CWL Object:
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
            style={{ marginLeft: 8 }}
          >
            {cwlObjects.map((_, index) => (
              <option key={index} value={index}>
                Object #{index}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => setReadonly(!readonly)}>
          Toggle Readonly (Currently {readonly ? "ON" : "OFF"})
        </button>
        <button onClick={() => setMinimap(!minimap)} style={{ marginLeft: 8 }}>
          Toggle Minimap (Currently {minimap ? "ON" : "OFF"})
        </button>
        <button
          onClick={() => setWrappers(!wrappers)}
          style={{ marginLeft: 8 }}
        >
          Toggle Wrappers (Currently {wrappers ? "ON" : "OFF"})
        </button>
      </div>

      <CwlEditor
        readonly={readonly}
        input={cwlObjects[selectedIndex]}
        onChange={handleOnChange}
        wrappers={wrappers}
        minimap={minimap}
        preview={preview}
      />
    </div>
  );
};
