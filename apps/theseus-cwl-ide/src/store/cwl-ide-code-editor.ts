import { action, computed, makeObservable, observable } from "mobx";

import { CwlCodeEditorProps } from "@theseus-cwl/ui-react-editor";

import { CwlIdeStore } from "./cwl-ide-store";
import { CwlSource, Shape } from "@theseus-cwl/types";

export const DEFAULT_CWL_IDE_CODE_EDITOR_OPTIONS: Omit<
  CwlCodeEditorProps,
  "input" | "onChange"
> = {
  readOnly: false,
  enableLineWrapping: false,
  enableCwlAutoCompletion: true,
  enableCwlHoverTooltip: true,
  enableLineNumbers: true,
  enableCodeFolding: true,
  enableSearch: true,
  enableBracketMatching: true,
  enableHighlightActiveLine: true,
  tabSize: 2,
  fontSize: 14,
};

export type CwlIdeCodeEditorParams = {
  store: CwlIdeStore;
  initialOptions: Omit<CwlCodeEditorProps, "input" | "onChange"> | undefined;
};

export class CwlIdeCodeEditor {
  readonly store: CwlIdeStore;

  @observable options:
    Omit<CwlCodeEditorProps, "input" | "onChange"> | undefined;

  constructor(params: CwlIdeCodeEditorParams) {
    this.store = params.store;
    this.options = {
      ...DEFAULT_CWL_IDE_CODE_EDITOR_OPTIONS,
      ...params.initialOptions,
    };

    makeObservable(this);
  }

  @action
  setOptions = (
    patch: Partial<Omit<CwlCodeEditorProps, "input" | "onChange">>,
  ) => {
    this.options = {
      ...this.options,
      ...patch,
    };
  };

  @action
  onChange = (value: CwlSource<Shape.Raw | Shape.Sanitized>) => {
    this.store.setAST(value);
  };

  @computed
  get value() {
    return this.store.ast;
  }
}
