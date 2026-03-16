import { action, computed, makeObservable, observable } from "mobx";

import { CwlIdeStore } from "./cwl-ide-store";
import { CwlSource, Shape } from "@theseus-cwl/types";

export const DEFAULT_CWL_VIEWER_OPTIONS: Record<string, unknown> = {
  wrap: false,
  fontSize: 14,
  autocomplete: true,
};

export type CwlIdeCodeEditorParams = {
  store: CwlIdeStore;
  initialOptions: Record<string, unknown> | undefined;
};

export class CwlIdeCodeEditor {
  readonly store: CwlIdeStore;

  @observable options: Record<string, unknown> | undefined;

  constructor(params: CwlIdeCodeEditorParams) {
    this.store = params.store;
    this.options = {
      ...DEFAULT_CWL_VIEWER_OPTIONS,
      ...params.initialOptions,
    };

    makeObservable(this);
  }

  @action
  setOptions = (patch: Record<string, unknown>) => {
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
