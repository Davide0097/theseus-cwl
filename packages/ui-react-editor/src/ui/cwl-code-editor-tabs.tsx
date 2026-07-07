import {
  CwlSourceParameter,
  CwlSourceDocument,
  Shape,
} from "@theseus-cwl/types";

type CwlCodeEditorTabsProps = {
  files: (CwlSourceParameter | CwlSourceDocument<Shape.Raw>)[];
  setSelectedFile: (fileName: string) => void;
};

export const CwlCodeEditorTabs = (props: CwlCodeEditorTabsProps) => {
  const { files, setSelectedFile } = props;

  return (
    <div className="cwl-code-editor-tabs">
      {files.map((file) => (
        <button key={file.name} onClick={() => setSelectedFile(file.name)}>
          {file.name}
        </button>
      ))}
    </div>
  );
};
