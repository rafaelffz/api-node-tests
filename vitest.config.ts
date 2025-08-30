import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/routes/**/*.ts"],
      exclude: ["**/*.test.ts"],
    },
  },
});
