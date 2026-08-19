import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures/test";

const { Given, When, Then } = createBdd(test);

Given("open and closed job roles are available", async () => {
	// The Playwright global setup resets and seeds the database before this scenario.
});

When("I view the job roles list", async ({ jobRoleListPage, page }) => {
	await jobRoleListPage.goto();
	await expect(page).toHaveURL(/\/job-role-list$/);
	await expect(page).toHaveTitle("Kainos Careers");
	await expect(jobRoleListPage.getHeading()).toBeVisible();
});

Then(
	"I should only see the available open job roles",
	async ({ jobRoleListPage }) => {
		await expect(jobRoleListPage.getRoleRow("Software Engineer")).toBeVisible();
		await expect(jobRoleListPage.getRoleRow("Delivery Manager")).toHaveCount(0);
	},
);
