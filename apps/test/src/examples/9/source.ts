import { CwlSource, Shape } from "@theseus-cwl/types";

export const object: CwlSource<Shape.Raw> = {
  entrypoint: "document.cwl",
  documents: [
    {
      name: "document.cwl",
      content: {
        cwlVersion: "v1.2",
        class: "Workflow",
        $graph: {
          "#main": {
            class: "Workflow",
            label: "Complex Environmental Modeling & Forecasting Pipeline",
            doc: "Combines meteorological and hydrological models: ingest observations, run ensemble simulations, couple models, downscale, and produce forecasts with uncertainty quantification.",
            inputs: {
              obs_files: { type: "File[]" },
              boundary_conditions: { type: "File" },
              model_configs: { type: "File[]" },
              forecast_horizon: { type: "int", default: "72" },
            },
            outputs: {
              ensemble_forecast: { type: "File", outputSource: "couple/out" },
              uncertainty_report: { type: "File", outputSource: "uq/out" },
            },
            steps: {
              obs_ingest: {
                run: "#ObsIngestWorkflow",
                in: { files: "obs_files" },
                out: ["observations"],
                scatter: "files",
              },
              preprocess: {
                run: "#PreprocessWorkflow",
                in: {
                  obs: "obs_ingest/observations",
                  bc: "boundary_conditions",
                },
                out: ["prep_obs"],
              },
              ensemble_run: {
                run: "#EnsembleWorkflow",
                in: {
                  obs: "preprocess/prep_obs",
                  configs: "model_configs",
                  horizon: "forecast_horizon",
                },
                out: ["ensembles"],
                scatter: "configs",
              },
              couple: {
                run: "#CouplingWorkflow",
                in: { ensembles: "ensemble_run/ensembles" },
                out: ["out"],
              },
              postprocess: {
                run: "#PostProcessingWorkflow",
                in: { forecast: "couple/out" },
                out: ["final"],
              },
              uq: {
                run: "#UncertaintyTool",
                in: { ensembles: "ensemble_run/ensembles" },
                out: ["out"],
              },
            },
          },
          "#EnsembleWorkflow": {
            class: "Workflow",
            label: "Run Ensemble Members",
            inputs: { obs: "File", configs: "File", horizon: "int" },
            outputs: {
              ensembles: { type: "File[]", outputSource: "member_run/out" },
            },
            steps: {
              member_run: {
                run: "#MemberModelTool",
                in: { obs: "obs", config: "configs", horizon: "horizon" },
                out: ["out"],
              },
            },
          },
          "#CouplingWorkflow": {
            class: "Workflow",
            label: "Model Coupling (Hydro-Meteo)",
            inputs: { ensembles: "File[]" },
            outputs: { out: { type: "File", outputSource: "merge/out" } },
            steps: {
              aggregate: {
                run: "#AggregateTool",
                in: { inputs: "ensembles" },
                out: ["agg"],
              },
              run_hydro: {
                run: "#HydroTool",
                in: { input: "aggregate/agg" },
                out: ["hydro_out"],
              },
              merge: {
                run: "#MergeTool",
                in: { inputs: "run_hydro/hydro_out" },
                out: ["out"],
              },
            },
          },
          "#UncertaintyTool": {
            class: "Workflow",
            label: "Uncertainty Quantification",
            inputs: { ensembles: "File[]" },
            outputs: { out: { type: "File", outputSource: "render/out" } },
            steps: {
              calc_stats: {
                run: "#StatsTool",
                in: { inputs: "ensembles" },
                out: ["stats"],
              },
              render: {
                run: "#RenderUQ",
                in: { stats: "calc_stats/stats" },
                out: ["out"],
              },
            },
          },
        },
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
class: Workflow
$graph:
  "#main":
    class: Workflow
    label: Complex Environmental Modeling & Forecasting Pipeline
    doc: "Combines meteorological and hydrological models: ingest observations, run ensemble simulations, couple models, downscale, and produce forecasts with uncertainty quantification."
    inputs:
      obs_files:
        type: File[]
      boundary_conditions:
        type: File
      model_configs:
        type: File[]
      forecast_horizon:
        type: int
        default: '72'
    outputs:
      ensemble_forecast:
        type: File
        outputSource: couple/out
      uncertainty_report:
        type: File
        outputSource: uq/out
    steps:
      obs_ingest:
        run: "#ObsIngestWorkflow"
        in:
          files: obs_files
        out: [observations]
        scatter: files
      preprocess:
        run: "#PreprocessWorkflow"
        in:
          obs: obs_ingest/observations
          bc: boundary_conditions
        out: [prep_obs]
      ensemble_run:
        run: "#EnsembleWorkflow"
        in:
          obs: preprocess/prep_obs
          configs: model_configs
          horizon: forecast_horizon
        out: [ensembles]
        scatter: configs
      couple:
        run: "#CouplingWorkflow"
        in:
          ensembles: ensemble_run/ensembles
        out: [out]
      postprocess:
        run: "#PostProcessingWorkflow"
        in:
          forecast: couple/out
        out: [final]
      uq:
        run: "#UncertaintyTool"
        in:
          ensembles: ensemble_run/ensembles
        out: [out]
  "#EnsembleWorkflow":
    class: Workflow
    label: Run Ensemble Members
    inputs:
      obs: File
      configs: File
      horizon: int
    outputs:
      ensembles:
        type: File[]
        outputSource: member_run/out
    steps:
      member_run:
        run: "#MemberModelTool"
        in:
          obs: obs
          config: configs
          horizon: horizon
        out: [out]
  "#CouplingWorkflow":
    class: Workflow
    label: Model Coupling (Hydro-Meteo)
    inputs:
      ensembles: File[]
    outputs:
      out:
        type: File
        outputSource: merge/out
    steps:
      aggregate:
        run: "#AggregateTool"
        in:
          inputs: ensembles
        out: [agg]
      run_hydro:
        run: "#HydroTool"
        in:
          input: aggregate/agg
        out: [hydro_out]
      merge:
        run: "#MergeTool"
        in:
          inputs: run_hydro/hydro_out
        out: [out]
  "#UncertaintyTool":
    class: Workflow
    label: Uncertainty Quantification
    inputs:
      ensembles: File[]
    outputs:
      out:
        type: File
        outputSource: render/out
    steps:
      calc_stats:
        run: "#StatsTool"
        in:
          inputs: ensembles
        out: [stats]

      render:
        run: "#RenderUQ"
        in:
          stats: calc_stats/stats
        out: [out]
`,
    },
  ],
  parameters: [],
};

export const source9 = { object, string };
