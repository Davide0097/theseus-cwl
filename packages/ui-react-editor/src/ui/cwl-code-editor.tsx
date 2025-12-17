import { yaml } from "@codemirror/lang-yaml";
import { EditorView, lineNumbers } from "@uiw/react-codemirror";

import CodeMirror from "@uiw/react-codemirror";

const CodeMirror_ = CodeMirror as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<any & React.RefAttributes<Element>>
>;

export type CwlCodeEditorProps = {
  value: string;
  onChange: () => void;
};

export const CwlCodeEditor = (props: CwlCodeEditorProps) => {
  const { value } = props;
  return (
    <CodeMirror_
      value={value}
      height="100%"
      theme="dark"
      extensions={[
        yaml(),
        lineNumbers(),
        // ide?.cwlCodeEditor.options?.wrap ? EditorView.lineWrapping : [],
      ]}
      //   onChange={(c) => ide?.cwlIdeStore.setAST(c)}
    />
  );
};
