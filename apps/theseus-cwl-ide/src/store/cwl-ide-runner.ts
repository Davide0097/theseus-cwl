import { action, observable } from "mobx";

import { CwlIdeStore, RunStatus } from "./cwl-ide-store";

export type Run = {
  runId: string;
  status: RunStatus;
  logs: string[];
  outputs: { id: string; fileName: string; content: string }[];
};

export type CwlIdeRunnerParams = {
  store: CwlIdeStore;
};

export class CwlIdeRunner {
  readonly store: CwlIdeStore;

  @observable runId: string | undefined = undefined;
  @observable pastRuns: Run[] = [];

  constructor(params: CwlIdeRunnerParams) {
    this.store = params.store;
    this.getPastRuns_();
  }

  @action
  async run() {
    this.store.setRunStatus(RunStatus.RUNNING);
    this.store.addLogs({
      component: "theseus-cwl-ide",
      text: "Run started...",
      timeStamp: new Date().toISOString(),
      type: "info",
    });

    if (!this.store.isValid) {
      this.store.setRunStatus(RunStatus.FAILED);
      this.store.addLogs({
        component: "theseus-cwl-ide",
        text: "Unable to run, fix validation errors before running",
        timeStamp: new Date().toISOString(),
        type: "error",
      });

      return false;
    }

    try {
      const response = await fetch("http://localhost:3004/api/v1/cwl/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cwl: this.store.ast }),
      });

      const { runId } = await response.json();
      this.pollRunStatus(runId);
    } catch (error: unknown) {
      this.store.setRunStatus(RunStatus.FAILED);

      const errorMessage =
        error instanceof Error
          ? `Run request failed: ${error.message}`
          : "Run request failed";

      this.store.addLogs({
        component: "theseus-cwl-ide",
        text: errorMessage,
        timeStamp: new Date().toISOString(),
        type: "error",
      });

      return false;
    }
  }

  @action
  async pollRunStatus(runId: string) {
    const interval = setInterval(async () => {
      try {
        const logResponse = await fetch(
          `http://localhost:3004/api/v1/cwl/run/${runId}/logs`,
        );
        const logs = await logResponse.json();

        if (logs.stdout) {
          logs.stdout.split("\n").map((line: string) => {
            this.store.addLogs({
              component: "theseus-cwl-runner",
              text: line,
              timeStamp: new Date().toISOString(),
              type: "info",
            });
          });
        }

        if (logs.stderr) {
          logs.stderr.split("\n").map((line: string) => {
            this.store.addLogs({
              component: "theseus-cwl-runner",
              text: line,
              timeStamp: new Date().toISOString(),
              type: "info",
            });
          });
        }

        const statusResponse = await fetch(
          `http://localhost:3004/api/v1/cwl/run/${runId}/status`,
        );
        const status = await statusResponse.json();

        if (status.status === "completed") {
          clearInterval(interval);
          this.store.setRunStatus(RunStatus.COMPLETED);
          this.store.addLogs({
            component: "theseus-cwl-ide",
            text: "Run request completed",
            timeStamp: new Date().toISOString(),
            type: "success",
          });
        } else if (status.status === "failed") {
          clearInterval(interval);
          this.store.setRunStatus(RunStatus.FAILED);
          this.store.addLogs({
            component: "theseus-cwl-ide",
            text: "Run request failed",
            timeStamp: new Date().toISOString(),
            type: "error",
          });
        }
      } catch (error: unknown) {
        clearInterval(interval);
        this.store.setRunStatus(RunStatus.FAILED);

        const errorMessage =
          error instanceof Error
            ? `Run request failed: ${error.message}`
            : "Run request failed";

        this.store.addLogs({
          component: "theseus-cwl-ide",
          text: errorMessage,
          timeStamp: new Date().toISOString(),
          type: "error",
        });
      }
    }, 1000);
  }

  @action
  private async getPastRuns_() {
    fetch("http://localhost:3004/api/v1/cwl/runs").then(async (response) => {
      const allRuns = await response.json();
      this.pastRuns = allRuns;
    });
  }
}
