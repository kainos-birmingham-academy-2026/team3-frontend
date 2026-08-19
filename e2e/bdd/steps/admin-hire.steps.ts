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

Given("I am logged in as an administrator", async ({
	loginPage,
	page,
	adminHireWorld,
}) => {
	// This flow relies on the seeded admin account.
	expect(adminHireWorld.adminEmail).toBeTruthy();

	await loginPage.goto();
	await loginPage.signIn(
		adminHireWorld.adminEmail,
		adminHireWorld.adminPassword,
	);

	await page.waitForURL(/^(?!.*login)/, { timeout: 5000 }).catch(() => {});
});

When(
	"I review a pending application",
	async ({ page, adminApplicationsPage, adminHireWorld }) => {
		const applicationsLink = page.getByRole("link", { name: /applications/i });
		await expect(applicationsLink).toBeVisible();
		await applicationsLink.click();
		await adminApplicationsPage.expectLoaded();

		adminHireWorld.pendingBeforeHire = await page
			.locator(".status-pending")
			.count();
		expect(adminHireWorld.pendingBeforeHire).toBeGreaterThan(0);
	},
);

When("I hire the applicant", async ({ adminApplicationsPage, page }) => {
	await adminApplicationsPage.clickFirstHireButton();
	await expect(page.locator("#popup-confirm")).toBeVisible();
	await adminApplicationsPage.confirmHiring();
	await adminApplicationsPage.expectSuccessMessage();
});

Then("the applicant status should change from pending to hired", async ({ page, adminHireWorld }) => {
	if (typeof adminHireWorld.pendingBeforeHire === "number") {
		const pendingAfterHire = await page.locator(".status-pending").count();
		expect(pendingAfterHire).toBeLessThan(adminHireWorld.pendingBeforeHire);
	}

	const hiredCount = await page.locator(".status-hired").count();
	expect(hiredCount).toBeGreaterThan(0);
});
