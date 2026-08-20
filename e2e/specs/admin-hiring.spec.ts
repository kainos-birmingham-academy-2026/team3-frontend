import { expect, test } from "../fixtures/test";
import { resetDatabase } from "../support/db";

test.describe("Admin hiring workflow", { tag: "@admin" }, () => {
	test.beforeAll(async () => {
		// Skip database setup in CI
		if (process.env.CI) {
			return;
		}

		// Use the shared helper so BDD/spec tests reset the DB the same way.
		// Prisma migrate reset also runs seed.
		resetDatabase();
	});

	test("successfully hire an applicant", async ({
		page,
		loginPage,
		adminApplicationsPage,
	}) => {
		await loginPage.goto();
		await loginPage.signIn("test@example.com", "password");

		await page.waitForURL(/^(?!.*login)/, { timeout: 5000 }).catch(() => {});

		await adminApplicationsPage.goto();
		await expect(
			adminApplicationsPage.getApplicationReviewHeading(),
		).toBeVisible();
		expect(
			await adminApplicationsPage.getPendingApplications().count(),
		).toBeGreaterThan(0);

		await adminApplicationsPage.clickFirstHireButton();

		await adminApplicationsPage.confirmHiring();

		await expect(adminApplicationsPage.getSuccessMessage()).toBeVisible();
	});
});
