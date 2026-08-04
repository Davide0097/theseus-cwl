import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Tests live outside `src` so they stay out of the tsc build path.
    include: ["test/**/*.test.ts"],
  },
});
