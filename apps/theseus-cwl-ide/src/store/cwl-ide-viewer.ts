import { BackgroundVariant } from "@xyflow/react";
import { action, computed, makeObservable, observable } from "mobx";

import { CwlViewerProps } from "@theseus-cwl/ui-react-viewer";

import { CwlIdeStore } from "./cwl-ide-store";

export const DEFAULT_CWL_IDE_VIEWER_OPTIONS: Omit<CwlViewerProps, "input"> = {
  minimap: false,
  wrappers: false,
  colorEditor: false,
  labels: false,
  background: {
    color: "transparent",
    // ! todo: re export from packages
    variant: "dots" as BackgroundVariant,
  },
};

export type CwlIdeViewerParams = {
  store: CwlIdeStore;
  initialOptions: Omit<CwlViewerProps, "input"> | undefined;
};

export class CwlIdeViewer {
  readonly store: CwlIdeStore;

  @observable options: Omit<CwlViewerProps, "input"> | undefined;

  constructor(params: CwlIdeViewerParams) {
    this.store = params.store;
    this.options = {
      ...DEFAULT_CWL_IDE_VIEWER_OPTIONS,
      ...params.initialOptions,
    };

    makeObservable(this);
  }

  @action
  setOptions = (patch: Partial<Omit<CwlViewerProps, "input">>) => {
    this.options = {
      ...this.options,
      ...patch,
    };
  };

  @computed
  get value() {
    return this.store.ast;
  }
}
