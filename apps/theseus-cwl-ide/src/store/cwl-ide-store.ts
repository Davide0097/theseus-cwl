import { CwlSource } from "@theseus-cwl/types";
import { action, computed, makeObservable, observable } from "mobx";

export enum ValidationStatus {
  VALIDATING = "VALIDATING",
  VALID = "VALID",
  NOT_VALID = "NOT_VALID",
}

export enum RunStatus {
  NOT_RUNNED = "NOT_RUNNED",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export type Log = {
  component: string;
  timeStamp: string;
  text: string;
  type: "error" | "info" | "success";
};

export type CwlIdeStoreParams = {
  /**
   * The initial source
   */
  source: CwlSource | undefined;
};

export class CwlIdeStore {
  /**
   * The abstract syntax tree
   */
  @observable ast: CwlSource | undefined;

  /**
   * The id of the selected file in the abstract syntax tree
   */
  @observable.ref selectedFileId: string | undefined = undefined;

  /**
   * The validation status
   */
  @observable validationStatus: ValidationStatus = ValidationStatus.NOT_VALID;

  /**
   * The run status
   */
  @observable runStatus: RunStatus = RunStatus.NOT_RUNNED;

  /**
   * The ide logs
   */
  @observable logs: Array<Log> = [];

  constructor(params: CwlIdeStoreParams) {
    const { source } = params;

    if (source) {
      this.setAST(source);

      const entrypointFile = source.documents?.find(
        (file) => file.name === source.entrypoint,
      );

      if (entrypointFile) {
        this.setSelectedFileId(entrypointFile.name);
      }
    }

    makeObservable(this);
  }

  @action
  setAST(ast: CwlSource) {
    // do not call directly
    this.ast = ast;
  }

  @action
  setSelectedFileId(selectedFileId: string) {
    this.selectedFileId = selectedFileId;
  }

  @action
  setValidationStatus(status: ValidationStatus): void {
    this.validationStatus = status;
  }

  @action
  setRunStatus(status: RunStatus): void {
    this.runStatus = status;
  }

  @computed
  get isValid(): boolean {
    return this.validationStatus === ValidationStatus.VALID;
  }

  @action
  addLogs(log: Log | Log[]): void {
    if (Array.isArray(log)) {
      this.logs.push(...log);
    } else {
      this.logs.push(log);
    }
  }
}
