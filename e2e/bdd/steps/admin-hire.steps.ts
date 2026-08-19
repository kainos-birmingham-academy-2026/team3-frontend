import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures/test";

const { Given, When, Then, Before } = createBdd(test);

Before(async () => {
	if (process.env.CI) {
		return;
	}

	const { exec } = await import("child_process");
	const { promisify } = await import("util");
	const execAsync = promisify(exec);

	try {
		await execAsync("npx prisma migrate reset --force", {
			cwd: process.cwd(),
		});

		await execAsync("npx prisma db seed", {
			cwd: process.cwd(),
		});
	} catch (error) {
		console.warn("Database reset/seed warning:", error);
	}
});

Given("i have an admin account already registered", async ({ adminHireWorld }) => {
	// This flow relies on the seeded admin account.
	expect(adminHireWorld.adminEmail).toBeTruthy();
});

When("i login to my administrator account", async ({
	loginPage,
	page,
	adminHireWorld,
}) => {
	await loginPage.goto();
	await loginPage.signIn(
		adminHireWorld.adminEmail,
		adminHireWorld.adminPassword,
	);

	await page.waitForURL(/^(?!.*login)/, { timeout: 5000 }).catch(() => {});
});

Then(
	"an application tab appears which takes me to the admin application portal",
	async ({ page, adminApplicationsPage }) => {
		const applicationsLink = page.getByRole("link", { name: /applications/i });
		await expect(applicationsLink).toBeVisible();
		await applicationsLink.click();
		await adminApplicationsPage.expectLoaded();
	},
);

Then(
	"on the applications table under the column labelled \"Action\"",
	async ({ page, adminApplicationsPage, adminHireWorld }) => {
		await adminApplicationsPage.expectLoaded();

		adminHireWorld.pendingBeforeHire = await page.locator(".status-pending").count();
		expect(adminHireWorld.pendingBeforeHire).toBeGreaterThan(0);
	},
);

When("i click on the hire button", async ({ adminApplicationsPage }) => {
	await adminApplicationsPage.clickFirstHireButton();
});

Then("recieve a popup to confirm", async ({ page }) => {
	await expect(page.locator("#popup-confirm")).toBeVisible();
});

Then("recieve a success message", async ({ adminApplicationsPage }) => {
	await adminApplicationsPage.confirmHiring();
	await adminApplicationsPage.expectSuccessMessage();
});

Then("applicant status goes from pending -> hired.", async ({ page, adminHireWorld }) => {
	if (typeof adminHireWorld.pendingBeforeHire === "number") {
		const pendingAfterHire = await page.locator(".status-pending").count();
		expect(pendingAfterHire).toBeLessThan(adminHireWorld.pendingBeforeHire);
	}

	const hiredCount = await page.locator(".status-hired").count();
	expect(hiredCount).toBeGreaterThan(0);
});
