import { useEffect, useRef, useState } from "react";
import YAML from "yaml";

import { CWL_EDITOR_ONCHANGE_DEBOUNCE_MS } from "@theseus-cwl/configurations";
import {
  CwlSource,
  CwlSourceDocument,
  CwlSourceParameter,
  Shape,
} from "@theseus-cwl/types";

import { useExtensions, UseExtensionsProps } from "../hooks";
import { CwlCodeEditorCode } from "./cwl-code-editor-code";
import { CwlCodeEditorTabs } from "./cwl-code-editor-tabs";

import "./style.css";

const getFileText = (
  file: CwlSourceDocument<Shape.Raw> | CwlSourceParameter | undefined,
  blobText: string,
): string => {
  if (!file || file.content === undefined) {
    return "";
  }

  if (typeof file.content === "string") {
    return file.content;
  }

  if (file.content instanceof File) {
    return blobText;
  }

  return YAML.stringify(file.content);
};

/**
 * Props for the CwlCodeEditor component.
 */
export type CwlCodeEditorProps = UseExtensionsProps & {
  /** CWL source whose documents and parameters are rendered as file tabs */
  input?: CwlSource<Shape.Raw>;

  /** Callback triggered (debounced) when the edited text changes. */
  onChange?: (value: CwlSource<Shape.Raw | Shape.Sanitized>) => void;

  /** If true, the editor will be rendered in read only mode */
  readOnly?: boolean;
};

export const CwlCodeEditor = (props: CwlCodeEditorProps) => {
  const { input, onChange, readOnly = false, ...extensionOptions } = props;

  const [selectedFileName, setSelectedFileName] = useState<string | undefined>(
    undefined,
  );
  /** Text of the active file's content when it is a `File` (read async). */
  const [blobText, setBlobText] = useState<string>("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const files: (CwlSourceParameter | CwlSourceDocument<Shape.Raw>)[] = input
    ? [...input.parameters, ...input.documents]
    : [];

  const defaultFileName =
    input?.documents.find((file) => file.name === input.entrypoint)?.name ??
    files[0]?.name;

  const activeFileName =
    selectedFileName && files.some((file) => file.name === selectedFileName)
      ? selectedFileName
      : defaultFileName;

  const activeFile = files.find((file) => file.name === activeFileName);

  const activeFileIsCwlDocument =
    input?.documents.some((document) => document.name === activeFileName) ??
    false;

  const { extensions } = useExtensions({
    ...extensionOptions,
    enableCwlAutoCompletion:
      activeFileIsCwlDocument &&
      (extensionOptions.enableCwlAutoCompletion ?? true),
    enableCwlHoverTooltip:
      activeFileIsCwlDocument &&
      (extensionOptions.enableCwlHoverTooltip ?? true),
  });

  useEffect(() => {
    setBlobText("");

    const content = activeFile?.content;

    if (!(content instanceof File)) {
      return;
    }

    let cancelled = false;

    content.text().then((text) => {
      if (!cancelled) {
        setBlobText(text);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [activeFile]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (value: string) => {
    if (!onChange || !input || !activeFileName) {
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onChange({
        ...input,
        documents: input.documents.map((document) =>
          document.name === activeFileName
            ? { ...document, content: value }
            : document,
        ),
        parameters: input.parameters.map((parameter) =>
          parameter.name === activeFileName
            ? { ...parameter, content: value }
            : parameter,
        ),
      });
    }, CWL_EDITOR_ONCHANGE_DEBOUNCE_MS);
  };

  return (
    <div className="cwl-code-editor-wrapper">
      <CwlCodeEditorTabs
        files={files}
        activeFileName={activeFileName}
        setSelectedFile={setSelectedFileName}
      />
      <CwlCodeEditorCode
        value={getFileText(activeFile, blobText)}
        onChange={handleChange}
        readOnly={readOnly}
        extensions={extensions}
      />
    </div>
  );
};
