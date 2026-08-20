import { expect, test } from "../fixtures/test";

test.describe("Admin hiring workflow", { tag: "@admin" }, () => {
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
