import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		exclude: ["e2e/**", "playwright-report/**", "test-results/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
		},
	},
});
