import { createBdd } from "playwright-bdd";
import { test } from "../fixtures/test";

const { Given, When, Then } = createBdd(test);

Given("open and closed job roles are available", async () => {
	// The Playwright global setup resets and seeds the database before this scenario.
});

When("I view the job roles list", async ({ jobRoleListPage }) => {
	await jobRoleListPage.goto();
	await jobRoleListPage.expectLoaded();
});

Then(
	"I should see the available open job roles",
	async ({ jobRoleListPage }) => {
		await jobRoleListPage.expectRoleVisible("Software Engineer");
	},
);

Then("I should not see closed job roles", async ({ jobRoleListPage }) => {
	await jobRoleListPage.expectRoleHidden("Delivery Manager");
});
