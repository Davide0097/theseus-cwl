import { action } from "mobx";

import { CwlViewerProps } from "@theseus-cwl/ui-react-viewer";
import { CwlSource } from "@theseus-cwl/types";

import { CwlIdeCodeEditor } from "./cwl-ide-code-editor";
import { CwlIdeStore } from "./cwl-ide-store";
import { CwlIdeValidator } from "./cwl-ide-validator";
import { CwlIdeViewer } from "./cwl-ide-viewer";
import { CwlIdeRunner } from "./cwl-ide-runner";

export type CWLIdeParams = {
  /**
   * The initial source
   */
  source: CwlSource;

  options:
    | {
        // ! todo: fix the editor typing
        editor: Record<string, any> | undefined;
        viewer: Omit<CwlViewerProps, "input"> | undefined;
      }
    | undefined;
};

export class CWLIde {
  /**
   * The single source of truth for the CwlIde's state
   */
  readonly store: CwlIdeStore;

  /**
   *
   */
  readonly codeEditor: CwlIdeCodeEditor;

  /**
   *
   */
  readonly viewer: CwlIdeViewer;

  /**
   *
   */
  readonly validator: CwlIdeValidator;

  /**
   *
   */
  readonly runner: CwlIdeRunner;

  constructor(params: CWLIdeParams) {
    this.store = new CwlIdeStore({ source: params.source });
    this.codeEditor = new CwlIdeCodeEditor({
      store: this.store,
      initialOptions: params.options?.editor,
    });
    this.viewer = new CwlIdeViewer({
      store: this.store,
      initialOptions: params.options?.viewer,
    });
    this.validator = new CwlIdeValidator({
      store: this.store,
    });
    this.runner = new CwlIdeRunner({
      store: this.store,
    });

    this.validator.validate();
  }

  @action
  updateState(ast: CwlSource) {
    this.store.setAST(ast);
    this.validator.validate();
  }

  @action
  runWorkflow() {
    this.runner.run();
  }
}
