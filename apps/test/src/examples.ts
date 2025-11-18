import { CWLPackedDocument, Shape, Workflow } from "@theseus-cwl/types";

export const cwlDocuments: (
  | Workflow<Shape.Raw>
  | CWLPackedDocument<Shape.Raw>
)[] = [
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Deep Learning Training + Hyperparameter Optimization + Export",
        doc: "Prepares data, performs distributed hyperparameter search, trains final model, prunes, converts to optimized format and registers artifact.",
        inputs: {
          raw_dataset: { type: "File" },
          schema: { type: "File" },
          model_family: {
            type: "string",
            default: "resnet",
          },
          hp_grid: { type: "string[]" },
          num_epochs: { type: "int", default: "25" },
          num_workers: { type: "int", default: "4" },
        },
        steps: {
          preprocess: {
            run: "#PreprocessWorkflow",
            in: { dataset: "validate/validated" },
            out: ["features"],
          },
          validate: {
            run: "#ValidateTool",
            in: { dataset: "raw_dataset", schema: "schema" },
            out: ["validated"],
          },
          hp_search: {
            run: "#HyperSearchWorkflow",
            in: {
              features: "preprocess/features",
              hp_grid: "hp_grid",
              model_family: "model_family",
              epochs: "num_epochs",
              workers: "num_workers",
            },
            out: ["candidates"],
            scatter: "hp_grid",
          },
          select_best: {
            run: "#SelectBestTool",
            in: { candidates: "hp_search/candidates" },
            out: ["best_config"],
          },
          train_final: {
            run: "#TrainWorkflow",
            in: {
              features: "preprocess/features",
              config: "select_best/best_config",
              epochs: "num_epochs",
            },
            out: ["model", "logs"],
          },
          compress: {
            run: "#CompressionWorkflow",
            in: { model: "train_final/model" },
            out: ["compressed"],
          },
          export: {
            run: "#ExportWorkflow",
            in: { model: "compress/compressed" },
            out: ["exported"],
          },
          register: {
            run: "#RegisterTool",
            in: { artifact: "export/exported", metadata: "train_final/logs" },
            out: ["artifact"],
          },
          report: {
            run: "#TrainingReportTool",
            in: { logs: "train_final/logs", model: "train_final/model" },
            out: ["training_report"],
          },
        },
        outputs: {
          deployed_artifact: {
            type: "File",
            outputSource: "register/artifact",
          },
          training_report: {
            type: "File",
            outputSource: "report/training_report",
          },
        },
      },
      "#PreprocessWorkflow": {
        class: "Workflow",
        label: "Preprocessing",
        inputs: { dataset: "File" },
        outputs: { features: { type: "File", outputSource: "extract/out" } },
        steps: {
          extract: {
            run: "#FeatureExtractor",
            in: { dataset: "dataset" },
            out: ["out"],
          },
        },
      },
      "#HyperSearchWorkflow": {
        class: "Workflow",
        label: "Hyperparameter Search",
        inputs: {
          features: "File",
          hp_grid: "string",
          model_family: "string",
          epochs: "int",
          workers: "int",
        },
        outputs: { candidates: { type: "File", outputSource: "worker/out" } },
        steps: {
          worker: {
            run: "#HyperWorker",
            in: {
              features: "features",
              hp: "hp_grid",
              model: "model_family",
              epochs: "epochs",
              workers: "workers",
            },
            out: ["out"],
          },
        },
      },
      "#TrainWorkflow": {
        class: "Workflow",
        label: "Distributed Training",
        inputs: { features: "File", config: "File", epochs: "int" },
        outputs: {
          model: { type: "File", outputSource: "trainer/model" },
          logs: { type: "File", outputSource: "trainer/logs" },
        },
        steps: {
          trainer: {
            run: "#TrainerTool",
            in: { features: "features", config: "config", epochs: "epochs" },
            out: ["model", "logs"],
          },
        },
      },
      "#CompressionWorkflow": {
        class: "Workflow",
        label: "Model Compression",
        inputs: { model: "File" },
        outputs: { compressed: { type: "File", outputSource: "quantize/out" } },
        steps: {
          prune: {
            run: "#PruneTool",
            in: { model: "model" },
            out: ["out"],
          },
          quantize: {
            run: "#QuantizeTool",
            in: { model: "prune/out" },
            out: ["out_quant"],
          },
        },
      },
      "#ExportWorkflow": {
        class: "Workflow",
        label: "Export",
        inputs: { model: "File" },
        outputs: { exported: { type: "File", outputSource: "bundle/bundle" } },
        steps: {
          convert: {
            run: "#ConvertTool",
            in: { model: "model" },
            out: ["out"],
          },
          bundle: {
            run: "#BundleTool",
            in: { artifact: "convert/out" },
            out: ["bundle"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Transcriptomics RNA-Seq End-to-End Pipeline",
        doc: "Performs QC, trimming, alignment, quantification, normalization, differential expression, and annotation with subworkflows and scatter over samples.",
        inputs: {
          fastq_pairs: { type: "File[]" },
          reference: { type: "File" },
          annotation_gtf: { type: "File" },
          sample_metadata: { type: "File" },
        },
        steps: {
          per_sample_qc: {
            run: "#PerSampleQCWorkflow",
            in: { pairs: "fastq_pairs" },
            out: ["clean_pairs"],
            scatter: "pairs",
          },
          align_quant: {
            run: "#AlignQuantWorkflow",
            in: {
              pairs: "per_sample_qc/clean_pairs",
              ref: "reference",
              gtf: "annotation_gtf",
            },
            out: ["bam", "counts"],
            scatter: "pairs",
          },
          merge_counts: {
            run: "#MergeCountsTool",
            in: { counts: "align_quant/counts" },
            out: ["matrix"],
          },
          normalize: {
            run: "#NormalizeTool",
            in: {
              matrix: "merge_counts/matrix",
              metadata: "sample_metadata",
            },
            out: ["norm_matrix"],
          },
          de_analysis: {
            run: "#DEWorkflow",
            in: {
              matrix: "normalize/norm_matrix",
              metadata: "sample_metadata",
            },
            out: ["report"],
          },
          quantify: {
            run: "#QuantificationTool",
            in: { bams: "align_quant/bam", gtf: "annotation_gtf" },
            out: ["counts"],
          },
        },
        outputs: {
          deg_report: { type: "File", outputSource: "de_analysis/report" },
          counts_matrix: { type: "File", outputSource: "quantify/counts" },
        },
      },
      "#PerSampleQCWorkflow": {
        class: "Workflow",
        label: "Per Sample QC/Trim",
        inputs: { pairs: "File[]" },
        steps: {
          fastqc: {
            run: "#FastQCTool",
            in: { input: "pairs" },
            out: ["qc"],
          },
          trim: {
            run: "#TrimTool",
            in: { input: "pairs", qc: "fastqc/qc" },
            out: ["out"],
            scatter: "input",
          },
        },
        outputs: {
          clean_pairs: { type: "File[]", outputSource: "trim/out" },
        },
      },
      "#AlignQuantWorkflow": {
        class: "Workflow",
        label: "Alignment + Quantification",
        inputs: { pairs: "File[]", ref: "File", gtf: "File" },
        steps: {
          align: {
            run: "#AlignerTool",
            in: { pairs: "pairs", ref: "ref" },
            out: ["out"],
            scatter: "pairs",
          },
          sort_index: {
            run: "#SortIndexTool",
            in: { bams: "align/out" },
            out: ["sorted"],
            scatter: "bams",
          },
          salmon: {
            run: "#SalmonTool",
            in: { pairs: "pairs", gtf: "gtf" },
            out: ["out"],
            scatter: "pairs",
          },
        },
        outputs: {
          bam: { type: "File[]", outputSource: "sort_index/sorted" },
          counts: { type: "File[]", outputSource: "salmon/out" },
        },
      },
      "#DEWorkflow": {
        class: "Workflow",
        label: "Differential Expression Analysis",
        inputs: { matrix: "File", metadata: "File" },
        steps: {
          deseq: {
            run: "#DESeq2Tool",
            in: { counts: "matrix", meta: "metadata" },
            out: ["report"],
          },
          annotate: {
            run: "#AnnotationTool",
            in: { report: "deseq/report", gtf: "metadata" },
            out: ["annotated"],
          },
        },
        outputs: {
          report: { type: "File", outputSource: "annotate/annotated" },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Transcriptomics RNA-Seq End-to-End Pipeline",
        doc: "Performs QC, trimming, alignment, quantification, normalization, differential expression, and annotation with subworkflows and scatter over samples.",
        inputs: {
          fastq_pairs: { type: "File[]" },
          reference: { type: "File" },
          annotation_gtf: { type: "File" },
          sample_metadata: { type: "File" },
        },
        outputs: {
          deg_report: { type: "File", outputSource: "de_analysis/report" },
          counts_matrix: { type: "File", outputSource: "quantify/counts" },
        },
        steps: {
          per_sample_qc: {
            run: "#PerSampleQCWorkflow",
            in: { pairs: "fastq_pairs" },
            out: ["clean_pairs"],
            scatter: "pairs",
          },
          align_quant: {
            run: "#AlignQuantWorkflow",
            in: {
              pairs: "per_sample_qc/clean_pairs",
              ref: "reference",
              gtf: "annotation_gtf",
            },
            out: ["bam", "counts"],
            scatter: "pairs",
          },
          merge_counts: {
            run: "#MergeCountsTool",
            in: { counts: "align_quant/counts" },
            out: ["matrix"],
          },
          normalize: {
            run: "#NormalizeTool",
            in: { matrix: "merge_counts/matrix", metadata: "sample_metadata" },
            out: ["norm_matrix"],
          },
          de_analysis: {
            run: "#DEWorkflow",
            in: {
              matrix: "normalize/norm_matrix",
              metadata: "sample_metadata",
            },
            out: ["report"],
          },
          quantify: {
            run: "#QuantificationTool",
            in: { bams: "align_quant/bam", gtf: "annotation_gtf" },
            out: ["counts"],
          },
        },
      },
      "#PerSampleQCWorkflow": {
        class: "Workflow",
        label: "Per Sample QC/Trim",
        inputs: { pairs: "File[]" },
        outputs: { clean_pairs: { type: "File[]", outputSource: "trim/out" } },
        steps: {
          fastqc: {
            run: "#FastQCTool",
            in: { input: "pairs" },
            out: ["qc"],
          },
          trim: {
            run: "#TrimTool",
            in: { input: "pairs", qc: "fastqc/qc" },
            out: ["out"],
            scatter: "input",
          },
        },
      },
      "#AlignQuantWorkflow": {
        class: "Workflow",
        label: "Alignment + Quantification",
        inputs: { pairs: "File[]", ref: "File", gtf: "File" },
        outputs: {
          bam: { type: "File[]", outputSource: "align/out" },
          counts: { type: "File[]", outputSource: "salmon/out" },
        },
        steps: {
          align: {
            run: "#AlignerTool",
            in: { pairs: "pairs", ref: "ref" },
            out: ["out"],
            scatter: "pairs",
          },
          sort_index: {
            run: "#SortIndexTool",
            in: { bams: "align/out" },
            out: ["sorted"],
            scatter: "bams",
          },
          salmon: {
            run: "#SalmonTool",
            in: { pairs: "pairs", gtf: "gtf" },
            out: ["out"],
            scatter: "pairs",
          },
        },
      },
      "#DEWorkflow": {
        class: "Workflow",
        label: "Differential Expression Analysis",
        inputs: { matrix: "File", metadata: "File" },
        outputs: { report: { type: "File", outputSource: "deseq/report" } },
        steps: {
          deseq: {
            run: "#DESeq2Tool",
            in: { counts: "matrix", meta: "metadata" },
            out: ["report"],
          },
          annotate: {
            run: "#AnnotationTool",
            in: { report: "deseq/report", gtf: "metadata" },
            out: ["annotated"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Enterprise Multi-Source ETL to Data Lake + Warehouse Loader",
        doc: "Ingests multiple data sources (APIs, S3, databases), applies schema validation, transforms, enriches with external lookups, partitions and loads into a Data Lake and then into a Warehouse.",
        inputs: {
          api_endpoints: { type: "string[]" },
          s3_buckets: { type: "string[]" },
          db_connections: { type: "string[]" },
          schema: { type: "File" },
          lookup_tables: { type: "File[]" },
        },
        outputs: {
          warehouse_manifest: { type: "File", outputSource: "load/manifest" },
          etl_report: { type: "File", outputSource: "report/summary" },
        },
        steps: {
          ingest_api: {
            run: "#APIIngestWorkflow",
            in: { endpoints: "api_endpoints" },
            out: ["api_files"],
            scatter: "endpoints",
          },
          ingest_s3: {
            run: "#S3IngestWorkflow",
            in: { buckets: "s3_buckets" },
            out: ["s3_files"],
            scatter: "buckets",
          },
          ingest_db: {
            run: "#DBIngestWorkflow",
            in: { connections: "db_connections" },
            out: ["db_exports"],
            scatter: "connections",
          },
          normalize: {
            run: "#NormalizeWorkflow",
            in: {
              inputs: {
                source: [
                  "ingest_api/api_files",
                  "ingest_s3/s3_files",
                  "ingest_db/db_exports",
                ],
              },
              schema: "schema",
            },
            out: ["normalized"],
          },
          enrich: {
            run: "#EnrichmentWorkflow",
            in: { data: "normalize/normalized", lookups: "lookup_tables" },
            out: ["enriched"],
          },
          partition: {
            run: "#PartitionTool",
            in: { data: "enrich/enriched" },
            out: ["partitions"],
          },
          load: {
            run: "#WarehouseLoader",
            in: { partitions: "partition/partitions" },
            out: ["manifest"],
          },
          report: {
            run: "#ETLReportTool",
            in: {
              sources: {
                source: [
                  "ingest_api/api_files",
                  "ingest_s3/s3_files",
                  "ingest_db/db_exports",
                ],
              },
              manifest: "load/manifest",
            },
            out: ["summary"],
          },
        },
      },
      "#APIIngestWorkflow": {
        class: "Workflow",
        label: "API Ingest Worker",
        inputs: { endpoints: "string" },
        outputs: { api_files: { type: "File", outputSource: "fetch/out" } },
        steps: {
          fetch: {
            run: "#FetchAPI",
            in: { url: "endpoints" },
            out: ["out"],
          },
          serialize: {
            run: "#SerializeTool",
            in: { data: "fetch/out" },
            out: ["out_file"],
          },
        },
      },
      "#NormalizeWorkflow": {
        class: "Workflow",
        label: "Normalize",
        inputs: { inputs: "File[]", schema: "File" },
        outputs: {
          normalized: { type: "File", outputSource: "normalize/out" },
        },
        steps: {
          validate: {
            run: "#ValidateTool",
            in: { files: "inputs", schema: "schema" },
            out: ["valid"],
          },
          transform: {
            run: "#TransformTool",
            in: { valid_files: "validate/valid" },
            out: ["out"],
          },
        },
      },
      "#EnrichmentWorkflow": {
        class: "Workflow",
        label: "Enrichment",
        inputs: { data: "File", lookups: "File[]" },
        outputs: { enriched: { type: "File", outputSource: "lookup/out" } },
        steps: {
          lookup: {
            run: "#LookupTool",
            in: { data: "data", lookups: "lookups" },
            out: ["enriched"],
          },
        },
      },
      "#WarehouseLoader": {
        class: "Workflow",
        label: "Load to Warehouse",
        inputs: { partitions: "File[]" },
        outputs: {
          manifest: {
            type: "File",
            outputSource: "aggregate_manifest/out_manifest",
          },
        },
        steps: {
          load_worker: {
            run: "#LoadWorker",
            in: { partition: "partitions" },
            out: ["worker_manifest"],
            scatter: "partition",
          },
          aggregate_manifest: {
            run: "#AggregateManifest",
            in: { inputs: "load_worker/worker_manifest" },
            out: ["out_manifest"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Large-Scale Audio Processing & Speech Recognition Pipeline",
        doc: "Batched ingestion of audio files, denoising, VAD, diarization, feature extraction, model inference for ASR, post-processing and summarization.",
        inputs: {
          audio_files: { type: "File[]" },
          language: { type: "string", default: "en-US" },
          vad_threshold: { type: "float", default: "0.5" },
        },
        outputs: {
          transcripts: { type: "File[]", outputSource: "asr/out" },
          summary: { type: "File", outputSource: "summarize/out" },
        },
        steps: {
          ingest: {
            run: "#AudioIngestWorkflow",
            in: { files: "audio_files" },
            out: ["ingested"],
            scatter: "files",
          },
          preprocess: {
            run: "#AudioPreprocessWorkflow",
            in: { audio: "ingest/ingested" },
            out: ["clean"],
            scatter: "audio",
          },
          vad: {
            run: "#VADWorkflow",
            in: { audio: "preprocess/clean", threshold: "vad_threshold" },
            out: ["segments"],
            scatter: "audio",
          },
          diarize: {
            run: "#DiarizationWorkflow",
            in: { segments: "vad/segments" },
            out: ["segments_with_speakers"],
            scatter: "segments",
          },
          feature_extract: {
            run: "#FeatureExtractTool",
            in: { segments: "diarize/segments_with_speakers" },
            out: ["features"],
            scatter: "segments_with_speakers",
          },
          asr: {
            run: "#ASRWorkflow",
            in: { features: "feature_extract/features", language: "language" },
            out: ["out"],
          },
          postprocess: {
            run: "#ASRPostProcess",
            in: { hypotheses: "asr/out" },
            out: ["clean_transcripts"],
          },
          summarize: {
            run: "#SummarizeTool",
            in: { transcripts: "postprocess/clean_transcripts" },
            out: ["out"],
          },
        },
      },
      "#AudioPreprocessWorkflow": {
        class: "Workflow",
        label: "Audio Preprocess",
        inputs: { audio: "File" },
        outputs: { clean: { type: "File", outputSource: "denoise/out" } },
        steps: {
          convert: {
            run: "#ConvertTool",
            in: { input: "audio", sr: "16000" },
            out: ["wav"],
          },
          denoise: {
            run: "#DenoiseTool",
            in: { wav: "convert/wav" },
            out: ["out"],
          },
        },
      },
      "#VADWorkflow": {
        class: "Workflow",
        label: "Voice Activity Detection",
        inputs: { audio: "File", threshold: "float" },
        outputs: { segments: { type: "File[]", outputSource: "detect/out" } },
        steps: {
          frame: {
            run: "#FrameTool",
            in: { audio: "audio" },
            out: ["frames"],
          },
          detect: {
            run: "#VADTool",
            in: { frames: "frame/frames", threshold: "threshold" },
            out: ["out"],
          },
        },
      },
      "#ASRWorkflow": {
        class: "Workflow",
        label: "Automatic Speech Recognition",
        inputs: { features: "File[]", language: "string" },
        outputs: { out: { type: "File[]", outputSource: "decode/out" } },
        steps: {
          decode: {
            run: "#ASRDecoder",
            in: { features: "features", lang: "language" },
            out: ["out"],
          },
          resegment: {
            run: "#ResegmentTool",
            in: { hyps: "decode/out" },
            out: ["out2"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label:
          "Video Analytics Pipeline with Scene Detection and Object Tracking",
        doc: "Ingests long-duration video, splits into scenes, runs object detection & multi-object tracking, aggregates tracklets, and produces analytics & event logs.",
        inputs: {
          video_files: { type: "File[]" },
          detection_model: { type: "File" },
          tracking_params: { type: "string", default: "{}" },
        },
        outputs: {
          analytics_report: { type: "File", outputSource: "analyze/report" },
          event_log: { type: "File", outputSource: "events/log" },
        },
        steps: {
          ingest: {
            run: "#VideoIngestWorkflow",
            in: { files: "video_files" },
            out: ["ingested"],
            scatter: "files",
          },
          scene_detect: {
            run: "#SceneDetectWorkflow",
            in: { video: "ingest/ingested" },
            out: ["scenes"],
            scatter: "ingested",
          },
          frame_extract: {
            run: "#FrameExtractWorkflow",
            in: { scenes: "scene_detect/scenes" },
            out: ["frames"],
            scatter: "scenes",
          },
          detect: {
            run: "#DetectionWorkflow",
            in: { frames: "frame_extract/frames", model: "detection_model" },
            out: ["detections"],
            scatter: "frames",
          },
          track: {
            run: "#TrackingWorkflow",
            in: { detections: "detect/detections", params: "tracking_params" },
            out: ["tracks"],
          },
          aggregate: {
            run: "#AggregateTracksTool",
            in: { tracks: "track/tracks" },
            out: ["aggregated"],
          },
          analyze: {
            run: "#AnalyticsTool",
            in: { tracks: "aggregate/aggregated" },
            out: ["report"],
          },
          events: {
            run: "#EventExtractionTool",
            in: { tracks: "aggregate/aggregated" },
            out: ["log"],
          },
        },
      },
      "#SceneDetectWorkflow": {
        class: "Workflow",
        label: "Scene Detection",
        inputs: { video: "File" },
        outputs: { scenes: { type: "File[]", outputSource: "detect/out" } },
        steps: {
          keyframe: {
            run: "#KeyframeTool",
            in: { video: "video" },
            out: ["keyframes"],
          },
          detect: {
            run: "#SceneTool",
            in: { keyframes: "keyframe/keyframes" },
            out: ["out"],
          },
        },
      },
      "#DetectionWorkflow": {
        class: "Workflow",
        label: "Frame-level Detection",
        inputs: { frames: "File[]", model: "File" },
        outputs: { detections: { type: "File[]", outputSource: "infer/out" } },
        steps: {
          infer: {
            run: "#DetectTool",
            in: { frame: "frames", model: "model" },
            out: ["out"],
            scatter: "frame",
          },
        },
      },
      "#TrackingWorkflow": {
        class: "Workflow",
        label: "Multi-Object Tracking",
        inputs: { detections: "File[]", params: "string" },
        outputs: { tracks: { type: "File", outputSource: "smooth/out" } },
        steps: {
          link: {
            run: "#LinkingTool",
            in: { detections: "detections", params: "params" },
            out: ["linked"],
          },
          smooth: {
            run: "#SmootherTool",
            in: { tracks: "link/linked" },
            out: ["out"],
          },
        },
      },
    },
  },
  {
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
            in: { obs: "obs_ingest/observations", bc: "boundary_conditions" },
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
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Climate Data Aggregation Workflow",
        doc: "Processes raw climate datasets, normalizes them, computes statistics, and generates final global summaries.",
        inputs: {
          dataset_urls: { type: "string[]" },
          variable_name: { type: "string" },
          region_mask: { type: "File" },
        },
        outputs: {
          global_summary: {
            type: "File",
            outputSource: "summarize/global_summary",
          },
        },
        steps: {
          fetch: {
            run: "#FetchWorkflow",
            in: {
              urls: "dataset_urls",
            },
            out: ["files"],
            scatter: "urls",
          },
          preprocess: {
            run: "#PreprocessWorkflow",
            in: {
              input_file: "fetch/files",
              mask: "region_mask",
              variable: "variable_name",
            },
            out: ["cleaned"],
            scatter: ["input_file", "variable"],
            scatterMethod: "dotproduct",
          },
          compute_stats: {
            run: "#StatsWorkflow",
            in: {
              dataset: "preprocess/cleaned",
            },
            out: ["stats"],
            scatter: "dataset",
          },
          summarize: {
            run: "#GlobalSummaryTool",
            in: {
              stats: "compute_stats/stats",
            },
            out: ["global_summary"],
          },
        },
      },
      "#FetchWorkflow": {
        class: "Workflow",
        inputs: {
          urls: "string[]",
        },
        outputs: {
          files: {
            type: "File",
            outputSource: "download/out_file",
          },
        },
        steps: {
          download: {
            run: "#DownloadTool",
            in: { url: "urls" },
            out: ["out_file"],
            scatter: "url",
          },
        },
      },
      "#PreprocessWorkflow": {
        class: "Workflow",
        inputs: {
          input_file: "File",
          mask: "File",
          variable: "string",
        },
        outputs: {
          cleaned: {
            type: "File",
            outputSource: "apply_mask/output",
          },
        },
        steps: {
          extract: {
            run: "#ExtractVariableTool",
            in: {
              file: "input_file",
              variable: "variable",
            },
            out: ["extracted"],
          },
          apply_mask: {
            run: "#MaskTool",
            in: {
              data: "extract/extracted",
              mask: "mask",
            },
            out: ["output"],
          },
        },
      },
      "#StatsWorkflow": {
        class: "Workflow",
        inputs: { dataset: "File" },
        outputs: {
          stats: { type: "File", outputSource: "compute/stats" },
        },
        steps: {
          compute: {
            run: "#StatisticsTool",
            in: { input: "dataset" },
            out: ["stats"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Genome Variant Calling Workflow",
        doc: "Performs quality control, alignment, variant calling, and generates reports.",
        inputs: {
          fastq_reads: { type: "File[]" },
          reference_genome: { type: "File" },
          sample_name: { type: "string" },
        },
        outputs: {
          vcf: { type: "File", outputSource: "call_variants/vcf" },
          report: { type: "File", outputSource: "report/report_file" },
        },
        steps: {
          qc: {
            run: "#QCWorkflow",
            in: { reads: "fastq_reads" },
            out: ["cleaned"],
            scatter: "reads",
          },
          align: {
            run: "#AlignWorkflow",
            in: {
              clean_read: "qc/cleaned",
              ref: "reference_genome",
            },
            out: ["bam"],
            scatter: "clean_read",
          },
          merge: {
            run: "#MergeTool",
            in: { inputs: "align/bam" },
            out: ["merged"],
          },
          call_variants: {
            run: "#VariantCaller",
            in: {
              bam: "merge/merged",
              ref: "reference_genome",
              sample: "sample_name",
            },
            out: ["vcf"],
          },
          report: {
            run: "#VariantReportTool",
            in: {
              variants: "call_variants/vcf",
              sample_id: "sample_name",
            },
            out: ["report_file"],
          },
        },
      },
      "#QCWorkflow": {
        class: "Workflow",
        inputs: { reads: "File" },
        outputs: {
          cleaned: {
            type: "File",
            outputSource: "trimmed/output",
          },
        },
        steps: {
          trimmed: {
            run: "#TrimTool",
            in: { input_fastq: "reads" },
            out: ["output"],
          },
        },
      },
      "#AlignWorkflow": {
        class: "Workflow",
        inputs: {
          clean_read: "File",
          ref: "File",
        },
        outputs: {
          bam: { type: "File", outputSource: "align/output" },
        },
        steps: {
          align: {
            run: "#AlignerTool",
            in: {
              read: "clean_read",
              reference: "ref",
            },
            out: ["output"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Machine Learning Training Pipeline",
        doc: "Processes raw datasets, engineers features, trains ML models, evaluates them, and uploads artifacts.",
        inputs: {
          dataset_csv: { type: "File" },
          model_type: { type: "string" },
          target_column: { type: "string" },
        },
        outputs: {
          trained_model: {
            type: "File",
            outputSource: "upload/model_artifact",
          },
          evaluation_report: {
            type: "File",
            outputSource: "evaluate/report",
          },
        },
        steps: {
          preprocess: {
            run: "#FeatureEngineeringWorkflow",
            in: {
              csv: "dataset_csv",
              target: "target_column",
            },
            out: ["features"],
          },
          train: {
            run: "#TrainWorkflow",
            in: {
              features: "preprocess/features",
              model_type: "model_type",
            },
            out: ["model"],
          },
          evaluate: {
            run: "#EvaluationTool",
            in: {
              model: "train/model",
              features: "preprocess/features",
              target: "target_column",
            },
            out: ["report"],
          },
          upload: {
            run: "#ArtifactUploader",
            in: {
              file: "train/model",
            },
            out: ["model_artifact"],
          },
        },
      },
      "#FeatureEngineeringWorkflow": {
        class: "Workflow",
        inputs: {
          csv: "File",
          target: "string",
        },
        outputs: {
          features: {
            type: "File",
            outputSource: "engineer/output",
          },
        },
        steps: {
          engineer: {
            run: "#FeatureEngineer",
            in: {
              input: "csv",
              target_col: "target",
            },
            out: ["output"],
          },
        },
      },
      "#TrainWorkflow": {
        class: "Workflow",
        inputs: {
          features: "File",
          model_type: "string",
        },
        outputs: {
          model: {
            type: "File",
            outputSource: "train/model",
          },
        },
        steps: {
          train: {
            run: "#TrainerTool",
            in: {
              training_data: "features",
              type: "model_type",
            },
            out: ["model"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "ETL Data Warehouse Pipeline",
        doc: "Extracts multiple sources, validates schemas, transforms records, merges them, and loads into final storage.",
        inputs: {
          source_urls: { type: "string[]" },
          schema_file: { type: "File" },
        },
        outputs: {
          final_table: {
            type: "File",
            outputSource: "load/output",
          },
        },
        steps: {
          extract: {
            run: "#ExtractWorkflow",
            in: { urls: "source_urls" },
            out: ["raw_files"],
            scatter: "urls",
          },
          validate: {
            run: "#SchemaValidationTool",
            in: {
              file: "extract/raw_files",
              schema: "schema_file",
            },
            out: ["valid_files"],
            scatter: "file",
          },
          transform: {
            run: "#TransformWorkflow",
            in: { record: "validate/valid_files" },
            out: ["transformed"],
            scatter: "record",
          },
          merge: {
            run: "#MergeRecordsTool",
            in: { inputs: "transform/transformed" },
            out: ["merged"],
          },
          load: {
            run: "#LoadToWarehouse",
            in: { table: "merge/merged" },
            out: ["output"],
          },
        },
      },
      "#ExtractWorkflow": {
        class: "Workflow",
        inputs: { urls: "string" },
        outputs: {
          raw_files: {
            type: "File",
            outputSource: "download/out",
          },
        },
        steps: {
          download: {
            run: "#DownloadTool",
            in: { url: "urls" },
            out: ["out"],
          },
        },
      },
      "#TransformWorkflow": {
        class: "Workflow",
        inputs: { record: "File" },
        outputs: { transformed: { type: "File", outputSource: "map/output" } },
        steps: {
          clean: {
            run: "#CleanerTool",
            in: { input: "record" },
            out: ["cleaned"],
          },
          map: {
            run: "#MappingTool",
            in: { input: "clean/cleaned" },
            out: ["output"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Satellite Analysis Workflow",
        doc: "Georeferences raw images, tiles them, applies ML models, merges classification outputs, and generates area statistics.",
        inputs: {
          raw_images: { type: "File[]" },
          model: { type: "File" },
        },
        outputs: {
          area_stats: { type: "File", outputSource: "stats/output" },
        },
        steps: {
          georef: {
            run: "#GeoRefTool",
            in: { image: "raw_images" },
            out: ["geo"],
            scatter: "image",
          },
          tiling: {
            run: "#TileWorkflow",
            in: { img: "georef/geo" },
            out: ["tiles"],
            scatter: "img",
          },
          classify: {
            run: "#ClassifierTool",
            in: {
              tile: "tiling/tiles",
              model: "model",
            },
            out: ["classified"],
            scatter: "tile",
          },
          merge: {
            run: "#MergeTilesTool",
            in: { tiles: "classify/classified" },
            out: ["merged"],
          },
          stats: {
            run: "#StatisticsTool",
            in: { input: "merge/merged" },
            out: ["output"],
          },
        },
      },
      "#TileWorkflow": {
        class: "Workflow",
        inputs: { img: "File" },
        outputs: {
          tiles: { type: "File", outputSource: "tile/out" },
        },
        steps: {
          tile: {
            run: "#TileTool",
            in: { input: "img" },
            out: ["out"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
        class: "Workflow",
        label: "Ensemble Simulation Workflow",
        doc: "Runs multiple simulation models in parallel with stochastic inputs and aggregates ensemble outputs.",
        inputs: {
          base_input: { type: "File" },
          seed_values: { type: "int[]" },
          ensemble_size: { type: "int" },
        },
        outputs: {
          ensemble_summary: {
            type: "File",
            outputSource: "aggregate/summary",
          },
        },
        steps: {
          simulate: {
            run: "#SimulationWorkflow",
            in: {
              input: "base_input",
              seed: "seed_values",
            },
            out: ["sim_output"],
            scatter: "seed",
          },
          aggregate: {
            run: "#AggregatorTool",
            in: { files: "simulate/sim_output" },
            out: ["summary"],
          },
        },
      },
      "#SimulationWorkflow": {
        class: "Workflow",
        inputs: { input: "File", seed: "int" },
        outputs: { sim_output: { type: "File", outputSource: "run/out" } },
        steps: {
          run: {
            run: "#SimulationTool",
            in: { input: "input", seed: "seed" },
            out: ["out"],
          },
        },
      },
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      main: {
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
    },
  },
  {
    cwlVersion: "v1.2",
    class: "Workflow",
    $graph: {
      "#main": {
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
      "#TextTransformWorkflow": {
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
      "#ComputationWorkflow": {
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
        run: "../grep/grep.cwl",
        in: {
          search_file: { source: "untar/uncompress_file" },
          search_string: { source: "search_string" },
        },
        out: "occurences",
      },
      untar: {
        run: "../tar/tar.cwl",
        in: {
          compress_file: { source: "zip_file" },
        },
        out: "uncompress_file",
      },
      wc: {
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
