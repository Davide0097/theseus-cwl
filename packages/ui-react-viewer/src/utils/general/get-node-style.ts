import { CSSProperties } from "react";

import {
  NODE_BACKGROUND_OPACITY,
  NODE_HEIGHT,
  NODE_WIDTH,
} from "@theseus-cwl/configurations";

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
  borderRadius: "var(--cwl-viewer-node-border-radius)",
  border: "1px solid var(--cwl-viewer-node-border-color)",
  boxShadow: "var(--cwl-viewer-node-shadow)",
  background: hexToRgba(color, NODE_BACKGROUND_OPACITY),
});

/**
 * Dashed style for the "+ New …" placeholder cards (shown only when `readOnly` is false).
 */
export const getPlaceholderNodeStyle = (color: string): CSSProperties => ({
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
  backgroundColor: hexToRgba(color, 0.2),
  borderRadius: "var(--cwl-viewer-node-border-radius)",
  border: "1px dashed var(--cwl-viewer-node-placeholder-border-color)",
  cursor: "pointer",
  margin: "0px",
  padding: "0px",
});
