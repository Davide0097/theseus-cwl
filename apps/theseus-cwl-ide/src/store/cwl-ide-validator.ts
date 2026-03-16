import { action } from "mobx";

import { CwlIdeStore, ValidationStatus } from "./cwl-ide-store";

export type CwlIdeValidatorParams = {
  store: CwlIdeStore;
};

export class CwlIdeValidator {
  readonly store: CwlIdeStore;

  constructor(params: CwlIdeValidatorParams) {
    this.store = params.store;
  }

  @action
  async validate(): Promise<boolean> {
    this.store.setValidationStatus(ValidationStatus.VALIDATING);
    this.store.addLogs({
      component: "theseus-cwl-ide",
      text: "Source changes detected, document validation request sent...",
      timeStamp: new Date().toISOString(),
      type: "info",
    });

    if (!this.store.ast) {
      this.store.setValidationStatus(ValidationStatus.NOT_VALID);
      this.store.addLogs({
        component: "theseus-cwl-ide",
        text: "No source to validate",
        timeStamp: new Date().toISOString(),
        type: "error",
      });

      return false;
    }

    try {
      const response = await fetch(
        "http://localhost:3003/api/v1/cwl/validate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cwl: this.store.ast }),
        },
      );

      const json: {
        success: boolean;
        data: { lines: Array<string>; valid: boolean; warnings: Array<string> };
      } = await response.json();

      if (json.success && json.data.valid) {
        this.store.setValidationStatus(ValidationStatus.VALID);
        json.data.lines.map((line) => {
          this.store.addLogs([
            {
              component: "theseus-cwl-validator",
              text: line,
              timeStamp: new Date().toISOString(),
              type: "info",
            },
          ]);
        });
        this.store.addLogs({
          component: "theseus-cwl-ide",
          text: "Validation request succeded",
          timeStamp: new Date().toISOString(),
          type: "success",
        });

        return true;
      } else {
        this.store.setValidationStatus(ValidationStatus.NOT_VALID);
        json.data.lines.map((line) => {
          this.store.addLogs([
            {
              component: "theseus-cwl-validator",
              text: line,
              timeStamp: new Date().toISOString(),
              type: "info",
            },
          ]);
        });
        this.store.addLogs([
          {
            component: "theseus-cwl-ide",
            text: "Validation request failed",
            timeStamp: new Date().toISOString(),
            type: "error",
          },
        ]);

        return false;
      }
    } catch (error: unknown) {
      this.store.setValidationStatus(ValidationStatus.NOT_VALID);

      const errorMessage =
        error instanceof Error
          ? `Validation request failed: ${error.message}`
          : "Validation request failed";

      this.store.addLogs({
        component: "theseus-cwl-ide",
        text: errorMessage,
        timeStamp: new Date().toISOString(),
        type: "error",
      });

      return false;
    }
  }
}
