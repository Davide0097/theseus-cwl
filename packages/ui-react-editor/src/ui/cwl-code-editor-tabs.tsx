import {
  CwlSourceParameter,
  CwlSourceDocument,
  Shape,
} from "@theseus-cwl/types";

type CwlCodeEditorTabsProps = {
  files: (CwlSourceDocument<Shape.Raw> | CwlSourceParameter)[];
  activeFileName?: string;
  setSelectedFile: (fileName: string) => void;
};

export const CwlCodeEditorTabs = (props: CwlCodeEditorTabsProps) => {
  const { files, activeFileName, setSelectedFile } = props;

  return (
    <div className="cwl-code-editor-tabs" role="tablist">
      {files.map((file) => {
        const isActive = file.name === activeFileName;

        return (
          <button
            key={file.name}
            role="tab"
            tabIndex={isActive ? 0 : -1}
            className={
              isActive ? "cwl-code-editor-tab active" : "cwl-code-editor-tab"
            }
            onClick={() => setSelectedFile(file.name)}
          >
            {file.name}
          </button>
        );
      })}
    </div>
  );
};
