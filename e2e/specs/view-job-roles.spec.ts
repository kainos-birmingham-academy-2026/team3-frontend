import { expect, test } from "../fixtures/test";

test.describe("View open job roles", () => {
	test("shows open roles and hides closed roles", async ({
		jobRoleListPage,
		page,
	}) => {
		await jobRoleListPage.goto();
		await expect(page).toHaveURL(/\/job-role-list$/);
		await expect(page).toHaveTitle("Kainos Careers");
		await expect(jobRoleListPage.getHeading()).toBeVisible();
		await expect(jobRoleListPage.getRoleRow("Software Engineer")).toBeVisible();
		await expect(jobRoleListPage.getRoleRow("Delivery Manager")).toHaveCount(0);
	});
});
