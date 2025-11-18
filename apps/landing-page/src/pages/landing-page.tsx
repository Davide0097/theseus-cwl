import { Github } from "lucide-react";
import { ReactNode, useState } from "react";

import {
  INPUT_NODE_COLOR,
  OUTPUT_NODE_COLOR,
  STEP_NODE_COLOR,
} from "@theseus-cwl/configurations";
import { Shape, Workflow } from "@theseus-cwl/types";
import { CwlViewer } from "@theseus-cwl/ui";

export type ToggleButtonProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
};
export const ToggleButton = (props: ToggleButtonProps) => {
  return (
    <button
      type="button"
      onClick={() => props.onChange(!props.checked)}
      className={`flex items-center gap-2 px-3 py-1 rounded-sm transition-all duration-200
        ${props.checked ? "bg-card/40 border border-border/50 shadow-glass text-foreground" : "bg-card/20 border border-border/30 text-muted-foreground"}
        backdrop-blur-glass`}
    >
      {props.children}
    </button>
  );
};

export const LandingPage = () => {
  const [minimap, setMinimap] = useState<boolean>(false);
  const [wrappers, setWrappers] = useState<boolean>(false);
  const [labels, setLabels] = useState<boolean>(false);
  const [colorEditor, setColorEditor] = useState<boolean>(false);
  const [initialColors, setInitialColors] = useState<{
    input: string;
    output: string;
    step: string;
  }>({
    input: INPUT_NODE_COLOR,
    step: STEP_NODE_COLOR,
    output: OUTPUT_NODE_COLOR,
  });

  // Editor section
  const [workflowJsonString, setWorkflowJsonString] = useState(
    JSON.stringify(
      {
        cwlVersion: "v1.2",
        class: "Workflow",
        inputs: { input_a: { id: "input_a", type: "string" } },
        steps: {
          step1: {
            id: "step1",
            run: "tools/step1.cwl",
            in: { param_a: { source: "input_a" } },
            out: ["out1"],
          },
        },
        outputs: {
          result: {
            id: "result",
            type: "File",
            outputSource: "step1/out1",
          },
        },
      } as Workflow<Shape.Raw>,
      null,
      2,
    ),
  );

  return (
    <>
      <div className="relative overflow-hidden bg-black min-h-screen flex items-center justify-center">
        {/* Blurred gradient blob background */}
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-3xl animate-spin-slow z-0" />
        <div className="absolute top-48 left-48 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-3xl animate-spin-slow z-0" />
        {/* Frosted glass blur overlay */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl z-0" />
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="mb-6 ">
              <div className="mb-6 flex justify-center gap-2 flex-wrap">
                <a
                  href="https://www.npmjs.com/package/@theseus-cwl/ui"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-[12px] px-4 py-1 bg-white/10 text-white border border-white/30 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition"
                >
                  <Github className="mr-2 h-4 w-4" /> @THESEUS-CWL/UI
                </a>
                <a
                  href="https://www.npmjs.com/package/@theseus-cwl/types"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-[12px] px-4 py-1 bg-white/10 text-white border border-white/30 rounded-2xl backdrop-blur-sm hover:bg-white/20 transition"
                >
                  <Github className="mr-2 h-4 w-4" /> @THESEUS-CWL/TYPES
                </a>
              </div>
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-white mb-8 leading-tight tracking-tight">
              Navigate the Labyrinth of
              <br />
              <span className="text-golden bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                CWL Workflows
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              A React toolkit for displaying CWL workflows as interactive graphs
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://github.com/Davide0097/theseus-cwl"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1 bg-white/10 text-white border border-white/30 rounded-lg backdrop-blur-sm hover:bg-white/20 transition"
              >
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* After hero section */}
      <div className="min-h-screen bg-gradient-marble">
        {/* Section heading */}
        <div className="text-center m-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            🚀 Explore the Viewer
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interact with a sample CWL workflow, customize colors, and toggle
            features.
          </p>
        </div>

        <div className="container mx-auto px-6 pb-6 pt-6 ">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CWL Viewer Viewer */}
            <div className="lg:col-span-2">
              <div className="bg-card/20 backdrop-blur-glass border-border/30 rounded-sm shadow-glass bg-gradient-glass">
                <div className="p-6 rounded-sm border border-border/50 bg-background/50">
                  {/* Controls */}
                  <div className="example-1-actions flex flex-wrap gap-2 mb-6">
                    <ToggleButton checked={minimap} onChange={setMinimap}>
                      Minimap
                    </ToggleButton>
                    <ToggleButton checked={wrappers} onChange={setWrappers}>
                      Wrappers
                    </ToggleButton>
                    <ToggleButton checked={labels} onChange={setLabels}>
                      Labels
                    </ToggleButton>
                    <ToggleButton
                      checked={colorEditor}
                      onChange={setColorEditor}
                    >
                      Color selector
                    </ToggleButton>
                    <label className="flex items-center gap-2 bg-card/20 border border-border/30 rounded-sm p-1 backdrop-blur-glass shadow-glass">
                      Input:
                      <input
                        className="w-10 h-8 rounded-md cursor-pointer border border-border/50"
                        type="color"
                        value={initialColors.input}
                        onChange={(event) =>
                          setInitialColors({
                            ...initialColors,
                            input: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="flex items-center gap-2 bg-card/20 border border-border/30 rounded-sm p-1 backdrop-blur-glass shadow-glass">
                      Step:
                      <input
                        className="w-10 h-8 rounded-md cursor-pointer border border-border/50"
                        type="color"
                        value={initialColors.step}
                        onChange={(event) =>
                          setInitialColors({
                            ...initialColors,
                            input: event.target.value,
                          })
                        }
                      />
                    </label>
                    <label className="flex items-center gap-2 bg-card/20 border border-border/30 rounded-sm p-1 backdrop-blur-glass shadow-glass">
                      Output:
                      <input
                        className="w-10 h-8 rounded-md cursor-pointer border border-border/50"
                        type="color"
                        value={initialColors.output}
                        onChange={(event) =>
                          setInitialColors({
                            ...initialColors,
                            input: event.target.value,
                          })
                        }
                      />
                    </label>
                  </div>
                  {/* Viewer */}
                  <div className="h-[800px] border-border/50 bg-white ">
                    <CwlViewer
                      input={{
                        cwlVersion: "v1.2",
                        class: "Workflow",
                        $graph: {
                          "#main": {
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
                          "#ImagePreprocessWorkflow": {
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
                          "#SegmentationWorkflow": {
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
                        },
                      }}
                      wrappers={wrappers}
                      minimap={minimap}
                      colorEditor={colorEditor}
                      initialColorState={initialColors}
                      labels={labels}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Features section */}
            <div className="space-y-6 flex items-center">
              <div className="bg-card/20 backdrop-blur-glass border-border/30 rounded-sm shadow-glass bg-gradient-glass">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    ✨ Features
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-golden rounded-full"></div>
                      <span>
                        <strong>Interactive Graph Viewer</strong> – explore
                        workflows visually with a clean and intuitive
                        graph-based interface.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-golden rounded-full"></div>
                      <span>
                        <strong>Flexible Input Support</strong> – easily load
                        workflows using JSON or yaml files.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-golden rounded-full"></div>
                      <span>
                        <strong>Configurable UI</strong> – tailor the interface
                        to your needs with theming, layout options, and reusable
                        elements.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      (
      <div className="min-h-screen bg-gradient-marble py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            🧪 Playground
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JSON Editor */}
            <textarea
              className="w-full h-[500px] p-3 rounded-md border"
              value={workflowJsonString}
              onChange={(event) => setWorkflowJsonString(event.target.value)}
            />
            {/* CWL Viewer */}
            {workflowJsonString && (
              <CwlViewer
                input={workflowJsonString}
                minimap={false}
                wrappers={false}
                colorEditor={false}
                labels={false}
              />
            )}
          </div>
        </div>
      </div>
      )
    </>
  );
};
