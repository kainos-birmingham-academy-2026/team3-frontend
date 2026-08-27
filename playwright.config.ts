/// <reference types="node" />
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import { defineBddConfig } from "playwright-bdd";

dotenv.config({ path: [path.resolve(__dirname, ".env.e2e"), path.resolve(__dirname, ".env")] });

const appPort = Number(process.env.PORT ?? 3000);
const baseURL =
	process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${appPort}`;
const apiBaseURL = process.env.API_BASE_URL ?? "http://localhost:4000";
const isDeployedTarget = !["localhost", "127.0.0.1", "::1"].includes(
	new URL(baseURL).hostname,
);
const bddTestDir = defineBddConfig({
	features: "e2e/bdd/features/**/*.feature",
	steps: ["e2e/bdd/steps/**/*.ts", "e2e/bdd/fixtures/test.ts"],
	outputDir: "e2e/specs",
});

// TEMPORARY: CI has no Postgres or backend, so the database-backed journey is skipped there.
// Delete this and swap the three "TEMPORARY" blocks below back to their commented-out
// originals once the backend is deployed remotely.
const needsDatabase = !process.env.CI && !isDeployedTarget;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: bddTestDir,
	testMatch: ["**/*.spec.ts", "**/*.spec.js"],
	// globalSetup: './e2e/globalSetup.ts',
	// globalTeardown: './e2e/globalTeardown.ts',
	// TEMPORARY
	testIgnore: [
		"**/.bdd-gen/**",
		...(process.env.CI
			? [
					"**/register-and-login.spec.ts",
					"**/admin-hiring.spec.ts",
					"**/view-job-roles.spec.ts",
					"**/e2e/bdd/**",
				]
			: isDeployedTarget
				? [
						"**/register-and-login.spec.ts",
						"**/admin-hiring.spec.ts",
						"**/e2e/bdd/**",
					]
				: []),
	],
	...(needsDatabase
		? {
				globalSetup: "./e2e/globalSetup.ts",
				globalTeardown: "./e2e/globalTeardown.ts",
			}
		: {}),
	timeout: 30_000,
	expect: {
		timeout: 5_000,
	},
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	outputDir: "test-results/playwright-artifacts",
	reporter: [
		["list"],
		["html", { outputFolder: "playwright-report", open: "never" }],
	],
	use: {
		baseURL,
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		video: "retain-on-failure",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
		{
			name: "firefox",
			use: { ...devices["Desktop Firefox"] },
		},
		{
			name: "webkit",
			use: { ...devices["Desktop Safari"] },
		},
	],

	webServer: [
		// {
		//   command: 'npm run dev',
		//   cwd: '../team3-backend',
		//   url: `${apiBaseURL}/health`,
		//   reuseExistingServer: !process.env.CI,
		//   stdout: 'pipe',
		//   stderr: 'pipe',
		// },
		// TEMPORARY
		...(needsDatabase
			? [
					{
						command: "npm run dev",
						cwd: "../team3-backend",
						url: `${apiBaseURL}/health`,
						reuseExistingServer: !process.env.CI,
						stdout: "pipe" as const,
						stderr: "pipe" as const,
					},
				]
			: []),
		...(!isDeployedTarget
			? [
					{
						command: "npm run dev",
						url: baseURL,
						reuseExistingServer: !process.env.CI,
						stdout: "pipe" as const,
						stderr: "pipe" as const,
						env: {
							...process.env,
							NODE_ENV: "test",
							PORT: String(appPort),
							SESSION_SECRET:
								process.env.SESSION_SECRET ?? "playwright-session-secret",
						},
					},
				]
			: []),
	],
});
