import { action } from "mobx";

import { CwlIdeStore, ValidationStatus } from "./cwl-ide-store";

/** Structured diagnostic returned by theseus-cwl-validator. */
type CwlValidationMessage = {
  severity: "error" | "warning" | "info";
  file?: string;
  line?: number;
  column?: number;
  text: string;
};

/** Compose a display line from a diagnostic, prefixing its source position. */
function formatValidationMessage(message: CwlValidationMessage): string {
  if (message.file && message.line != null && message.column != null) {
    return `${message.file}:${message.line}:${message.column} ${message.text}`;
  }

  return message.text;
}

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
        data: {
          valid: boolean;
          messages: Array<CwlValidationMessage>;
          lines: Array<string>;
        };
      } = await response.json();

      // The validator now returns structured, path-cleaned diagnostics; the IDE
      // only decides how to present them (severity -> log type + position text).
      const messages = json.data?.messages ?? [];

      messages.forEach((message) => {
        this.store.addLogs([
          {
            component: "theseus-cwl-validator",
            text: formatValidationMessage(message),
            timeStamp: new Date().toISOString(),
            type: message.severity,
          },
        ]);
      });

      if (json.success && json.data.valid) {
        this.store.setValidationStatus(ValidationStatus.VALID);
        this.store.addLogs({
          component: "theseus-cwl-ide",
          text: "Validation request succeded",
          timeStamp: new Date().toISOString(),
          type: "success",
        });

        return true;
      } else {
        this.store.setValidationStatus(ValidationStatus.NOT_VALID);
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
