import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures/test";

const { Given, When, Then } = createBdd(test);

Given("I am on the sign-in page", async ({ loginPage }) => {
	await loginPage.goto();
	await loginPage.expectLoaded();
});

When("I submit the form without sign-in details", async ({ loginPage }) => {
	await loginPage.signIn("", "");
});

Then(
	"I see a message asking me to enter an email and password",
	async ({ loginPage }) => {
		await loginPage.expectLoaded();
		await loginPage.expectError("Enter both email and password");
	},
);

When(
	"I submit the form with unrecognised sign-in details",
	async ({ loginPage }) => {
		await loginPage.signIn("unrecognised@example.com", "Password123!");
	},
);

Then(
	"I see a message that my email or password is invalid",
	async ({ loginPage }) => {
		await loginPage.expectLoaded();
		await loginPage.expectError("Invalid email or password");
	},
);

Given(
	"I have signed in to my account",
	async ({ authApi, homePage, loginPage, user }) => {
		const response = await authApi.register(user);
		expect(response.status()).toBe(201);

		await loginPage.goto();
		await loginPage.signIn(user.email, user.password);
		await homePage.expectLoaded();
		await homePage.expectSignedIn();
	},
);

When("I visit the sign-in page", async ({ loginPage }) => {
	await loginPage.goto();
});

Then("I am returned to the home page", async ({ homePage }) => {
	await homePage.expectLoaded();
	await homePage.expectSignedIn();
});
