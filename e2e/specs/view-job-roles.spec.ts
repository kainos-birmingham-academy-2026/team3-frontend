import { test } from "../fixtures/test";

test.describe("View open job roles", () => {
	test("shows open roles and hides closed roles", async ({
		jobRoleListPage,
	}) => {
		await jobRoleListPage.goto();
		await jobRoleListPage.expectLoaded();
		await jobRoleListPage.expectRoleVisible("Software Engineer");
		await jobRoleListPage.expectRoleHidden("Delivery Manager");
	});
});
