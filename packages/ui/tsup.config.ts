import { defineConfig } from "tsup";

export default defineConfig({
  // Entry point for the build
  entry: ["src/index.ts"],

  // Output both ESM (import/export) and CJS (require) formats
  format: ["esm", "cjs"],

  // Generate TypeScript declaration files (.d.ts)
  dts: {
    entry: "src/index.ts",
  },

  // Output directory for the compiled files
  outDir: "dist",

  // Do not bundle these dependencies (important for libraries)
  external: ["react", "react-dom"],

  // Disable code splitting (produces one file per format)
  splitting: false,

  // Clean the output directory before each build
  clean: true,

  // Don't bundle dependencies from node_modules
  skipNodeModulesBundle: true,

  // How to handle imported CSS files
  // "copy" → place them in dist as-is
  loader: {
    ".css": "copy",
  },
});
