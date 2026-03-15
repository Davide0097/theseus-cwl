import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { yaml } from "@codemirror/lang-yaml";
import { hoverTooltip } from "@codemirror/view";
import CodeMirror, {
  EditorView,
  lineNumbers,
  ReactCodeMirrorProps,
  ViewUpdate,
} from "@uiw/react-codemirror";
import { useEffect, useMemo, useState } from "react";
import YAML from "yaml";

import {
  CWL_FILE_KEYWORDS,
  CWL_FILE_KEYWORDS_DOCUMENTATION,
} from "@theseus-cwl/configurations";
import { CwlSource, Shape } from "@theseus-cwl/types";

import "./style.css";

export const cwlCompletion = () => {
  return autocompletion({
    override: [
      (ctx: CompletionContext) => {
        const word = ctx.matchBefore(/\w*/);
        if (!word) {
          return null;
        }

        return {
          from: word.from,
          options: CWL_FILE_KEYWORDS.filter((keyword) =>
            keyword.startsWith(word.text),
          ).map((keyword) => ({ label: keyword, type: "keyword" })),
        };
      },
    ],
  });
};

export const cwlHover = () => {
  return hoverTooltip((view, pos) => {
    const word = view.state.doc
      .sliceString(pos - 20, pos + 20)
      .match(/\b\w+\b/);

    if (!word) {
      return null;
    }

    const key = word[0] as keyof typeof CWL_FILE_KEYWORDS_DOCUMENTATION;
    const info = CWL_FILE_KEYWORDS_DOCUMENTATION[key];

    if (!info) {
      return null;
    }

    return {
      pos: pos,
      end: pos,
      create: () => {
        const dom = document.createElement("div");
        dom.textContent = info;
        dom.style.padding = "4px";
        dom.style.backgroundColor = "#222";
        dom.style.color = "white";
        dom.style.borderRadius = "4px";
        return { dom };
      },
    };
  });
};

const CodeMirror_ = CodeMirror as unknown as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ReactCodeMirrorProps & React.RefAttributes<Element>
  >
>;

/**
 * Props for the CwlCodeEditor component.
 */
export type CwlCodeEditorProps = {
  /** CWL source to be loaded into the editor */
  input?: CwlSource<Shape.Raw | Shape.Sanitized>;

  activeFileId?: string;

  /** Callback triggered when the cwl file changes, default is a function that logs in the console the changes */
  onChange?: (value: CwlSource<Shape.Sanitized>) => void;

  /** If true, the editor lines will be wrapped */
  wrap?: boolean;

  /** If true, the editor will be rendered in read only mode */
  readOnly?: boolean;

  fontSize?: number;
};

export const CwlCodeEditor = (props: CwlCodeEditorProps) => {
  const {
    input = undefined,
    activeFileId = undefined,
    readOnly = false,
    onChange = (value) => console.log(value),
    fontSize = "24px",
    wrap = true,
  } = props;

  const [cwlOrInputFile, setCwlOrInputFile] = useState<string | undefined>(
    undefined,
  );
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>(
    input?.entrypoint,
  );

  useEffect(() => {
    if (!input || !selectedFileId) {
      setCwlOrInputFile(undefined);
      return;
    }

    (async () => {
      const cwlFile = input.documents.find(
        (file) => file.name === selectedFileId,
      );

      if (cwlFile) {
        setCwlOrInputFile(
          typeof cwlFile.content === "string"
            ? cwlFile.content
            : YAML.stringify(cwlFile.content),
        );
      }

      const inputFile = input.parameters.find(
        (file) => file.name === selectedFileId,
      );

      if (inputFile) {
        setCwlOrInputFile(inputFile.content as string);
      }
      // const cwlFile = input.documents.find(
      //   (file: any) => file.id === selectedFileId,
      // );
      // if (cwlFile) {
      //   const workflow = await CWLSourceHolder.create(input as any);
      //   setCwlOrInputFile(YAML.stringify(workflow.activeFile));
      // }
      // const inputFile = input.inputs.find(
      //   (file: any) => file.id === selectedFileId,
      // );
      // if (inputFile) {
      //   setCwlOrInputFile(inputFile.content as any);
      // }
    })();
  }, [input, selectedFileId]);

  useEffect(() => {
    if (activeFileId) {
      setSelectedFileId(activeFileId);
    }
  }, [activeFileId]);

  const extensions = useMemo(() => {
    return [
      yaml(),
      lineNumbers(),
      cwlCompletion(),
      cwlHover(),
      wrap ? EditorView.lineWrapping : [],
    ];
  }, [wrap]);

  const onValueChange = async (value: string, viewUpdate: ViewUpdate) => {
    if (!input || !selectedFileId) {
      return;
    }

    const updatedSource = {
      ...input,
      documents: input.documents.map((file) => ({ ...file })),
      parameters: input.parameters.map((file) => ({ ...file })),
    };

    // Check if worflow file and not input
    const fileIndex = updatedSource.documents.findIndex(
      (file) => file.name === selectedFileId,
    );

    if (fileIndex !== -1) {
      updatedSource.documents[fileIndex]!.content = value;
    }

    // Or if it's an input file
    const inputIndex = updatedSource.parameters.findIndex(
      (i) => i.name === selectedFileId,
    );

    if (inputIndex !== -1) {
      updatedSource.parameters[inputIndex]!.content = value;
    }

    // onChange?.(updatedSource);
  };

  if (!cwlOrInputFile || !input) {
    return null;
  }

  return (
    <div className="cwl-code-editor">
      <div className="cwl-tabs">
        {[...input.parameters, ...input.documents].map((file) => (
          <button
            key={file.name}
            className={file.name === selectedFileId ? "active" : ""}
            onClick={() => setSelectedFileId(file.name)}
          >
            {file.name}
          </button>
        ))}
      </div>
      <div className="scrollable">
        <CodeMirror_
          theme="dark"
          editable={!readOnly}
          extensions={extensions}
          onChange={onValueChange}
          value={cwlOrInputFile}
        />
      </div>
    </div>
  );
};
