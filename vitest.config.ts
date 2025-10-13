import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "components/tests/**/*.test.ts",
      "components/tests/**/*.test.tsx"
    ],
    coverage: {
      reporter: ["text", "lcov"],
      provider: "v8"
    }
  }
});
