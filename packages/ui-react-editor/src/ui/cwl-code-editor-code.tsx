import CodeMirror, {
  Extension,
  ReactCodeMirrorProps,
} from "@uiw/react-codemirror";

const CodeMirror_ = CodeMirror as unknown as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    ReactCodeMirrorProps & React.RefAttributes<Element>
  >
>;

type CwlCodeEditorCodeProps = {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  extensions: Extension[];
};

export const CwlCodeEditorCode = (props: CwlCodeEditorCodeProps) => {
  const { value, onChange, readOnly, extensions } = props;

  return (
    <div className="cwl-code-editor">
      <CodeMirror_
        basicSetup={false}
        theme="none"
        value={value}
        onChange={onChange}
        editable={!readOnly}
        extensions={extensions}
      />
    </div>
  );
};
