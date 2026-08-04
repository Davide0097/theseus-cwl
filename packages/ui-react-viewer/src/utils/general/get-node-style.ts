import { CSSProperties } from "react";

import { NODE_HEIGHT, NODE_WIDTH } from "@theseus-cwl/configurations";

import { hexToRgba } from "./colors";

/**
 * Shared card style for input/step/output nodes. Reads the configuration
 * constants at call time so `configureTheseusCwl` overrides stay live.
 */
export const getNodeStyle = (color: string): CSSProperties => ({
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
  margin: "0px",
  padding: "0px",
  borderRadius: "6px",
  border: "1px solid rgba(0, 0, 0, 0.60)",
  boxShadow: "4px 4px 16px rgba(0, 0, 0, 0.05)",
  background: hexToRgba(color, 0.3),
});

/**
 * Dashed style for the "+ New …" placeholder cards (shown only when `readOnly` is false).
 */
export const getPlaceholderNodeStyle = (color: string): CSSProperties => ({
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
  backgroundColor: hexToRgba(color, 0.2),
  border: "1px dashed #1a192b",
  cursor: "pointer",
  margin: "0px",
  padding: "0px",
});
