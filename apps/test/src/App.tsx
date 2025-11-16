import { CWLPackedDocument, Workflow } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui";

import { useState } from "react";

const cwlObjects: (Workflow | CWLPackedDocument)[] = [
  {
    cwlVersion: "v1.0",
    class: "Workflow",
    $graph: [
      {
        id: "main",
        class: "Workflow",
        label:
          "Mosaics two or more Landsat-8 acquisitions (includes pan-sharpening)",
        doc: "Mosaics two or more Landsat-8 acquisitions (includes pan-sharpening)",

        requirements: [
          { class: "ScatterFeatureRequirement" },
          { class: "SubworkflowFeatureRequirement" },
        ],

        inputs: {
          stac_items: {
            doc: "Landsat-8 item",
            type: "string[]",
          },
        },

        outputs: {
          mosaic: {
            type: "File",
            outputSource: "node_mosaic/mosaic",
          },
        },

        steps: {
          node_ps: {
            run: "pan-sharpening.cwl",
            in: {
              stac_item: "stac_items",
            },
            out: ["ps_tif"],
            scatter: "stac_item",
            scatterMethod: "dotproduct",
          },

          node_mosaic: {
            run: "aggregate.cwl",
            in: {
              tifs: { source: ["node_ps/ps_tif"] },
            },
            out: ["mosaic"],
          },
        },
      },
    ],
  },

  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: [
      {
        id: "#main",
        class: "Workflow",
        label: "Main Workflow",
        doc: "Combines text transformation and computation results, then finalizes them into a report file.",
        inputs: {
          text_input: { type: "string" },
          numeric_input: { type: "string" },
          list_input: { type: "string[]" },
        },
        outputs: {
          final_report: {
            type: "File",
            outputSource: "finalize/report",
          },
        },
        steps: {
          text_process: {
            run: "#TextTransformWorkflow",
            in: {
              message: "text_input",
            },
            out: ["out_text"],
          },
          compute_data: {
            run: "#ComputationWorkflow",
            in: {
              param_a: "numeric_input",
              param_list: "list_input",
            },
            out: ["out_file"],
          },
          finalize: {
            run: "#FinalizeTool",
            in: {
              text: "text_process/out_text",
              data: "compute_data/out_file",
            },
            out: ["report"],
          },
        },
      },
      {
        id: "#TextTransformWorkflow",
        class: "Workflow",
        label: "Text Transformation Workflow",
        doc: "Applies text transformations such as trimming and uppercasing to an input message.",
        inputs: {
          message: { type: "string" },
        },
        outputs: {
          out_text: {
            type: "string",
            outputSource: "transform/output_text",
          },
        },
        steps: {
          transform: {
            run: "#TextTransformTool",
            in: { input_message: "message" },
            out: ["output_text"],
          },
        },
      },
      {
        id: "#ComputationWorkflow",
        class: "Workflow",
        label: "Computation Workflow",
        doc: "Performs mock computations on input parameters and produces a combined data file.",
        inputs: {
          param_a: { type: "string" },
          param_list: { type: "string[]" },
        },
        outputs: {
          out_file: {
            type: "File",
            outputSource: "combine/result",
          },
        },
        steps: {
          analyze: {
            run: "#AnalyzeTool",
            in: { input_value: "param_a" },
            out: ["report"],
          },
          aggregate: {
            run: "#AggregateTool",
            in: { inputs: "param_list" },
            out: ["summary"],
          },
          combine: {
            run: "#CombineTool",
            in: {
              analysis: "analyze/report",
              summary: "aggregate/summary",
            },
            out: ["result"],
          },
        },
      },
    ],
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
    $graph: [
      {
        id: "#main",
        class: "Workflow",
        label: "Main Image Processing Workflow",
        doc: "Coordinates preprocessing, segmentation, and final report generation from an input image.",
        inputs: {
          input_image: { type: "File" },
          filter_strength: { type: "int" },
          model_type: { type: "string" },
        },
        outputs: {
          report: {
            type: "File",
            outputSource: "report_generation/report_file",
          },
        },
        steps: {
          preprocessing: {
            run: "#ImagePreprocessWorkflow",
            in: {
              raw_image: "input_image",
              strength: "filter_strength",
            },
            out: ["clean_image"],
          },
          segmentation: {
            run: "#SegmentationWorkflow",
            in: {
              image: "preprocessing/clean_image",
              model: "model_type",
            },
            out: ["mask_image"],
          },
          report_generation: {
            run: "#ReportTool",
            in: {
              original: "input_image",
              cleaned: "preprocessing/clean_image",
              mask: "segmentation/mask_image",
            },
            out: ["report_file"],
          },
        },
      },
      {
        id: "#ImagePreprocessWorkflow",
        class: "Workflow",
        label: "Image Preprocessing Workflow",
        doc: "Cleans and filters an image before analysis.",
        inputs: {
          raw_image: { type: "File" },
          strength: { type: "int" },
        },
        outputs: {
          clean_image: {
            type: "File",
            outputSource: "enhance/enhanced_image",
          },
        },
        steps: {
          denoise: {
            run: "#DenoiseTool",
            in: { image: "raw_image" },
            out: ["denoised_image"],
          },
          enhance: {
            run: "#EnhanceTool",
            in: {
              image: "denoise/denoised_image",
              level: "strength",
            },
            out: ["enhanced_image"],
          },
        },
      },
      {
        id: "#SegmentationWorkflow",
        class: "Workflow",
        label: "Segmentation Workflow",
        doc: "Applies deep learning models to segment key regions in the input image.",
        inputs: {
          image: { type: "File" },
          model: { type: "string" },
        },
        outputs: {
          mask_image: {
            type: "File",
            outputSource: "apply_model/mask",
          },
        },
        steps: {
          normalize: {
            run: "#NormalizeTool",
            in: { image: "image" },
            out: ["normalized_image"],
          },
          apply_model: {
            run: "#SegmentationTool",
            in: {
              image: "normalize/normalized_image",
              model_name: "model",
            },
            out: ["mask"],
          },
        },
      },
    ],
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
          // extended: { default: true },
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
          // extended: { default: true },
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
