import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    entry: "src/index.ts",
  },
  outDir: "dist",
  external: ["react", "react-dom"],
  splitting: false,
  clean: true,
  skipNodeModulesBundle: true,
  loader: {
    ".css": "copy",
  },
});
