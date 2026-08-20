import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures/test";

const { Given, When, Then } = createBdd(test);

Given("I am on the registration page", async ({ registerPage }) => {
	await registerPage.goto();
	await registerPage.expectLoaded();
});

When(
	"I submit the form without the required account details",
	async ({ registerPage }) => {
		await registerPage.fillForm("", "", "");
		await registerPage.submit();
	},
);

Then(
	"I see a message asking me to enter an email, password and password confirmation",
	async ({ registerPage }) => {
		await registerPage.expectLoaded();
		await registerPage.expectError(
			"Enter email, password and confirm password",
		);
	},
);

When(
	"I submit the form with different passwords",
	async ({ registerPage, user }) => {
		await registerPage.fillForm(user.email, user.password, "DifferentPassword1!");
		await registerPage.submit();
	},
);

Then("I see a message that my passwords do not match", async ({ registerPage }) => {
	await registerPage.expectLoaded();
	await registerPage.expectError("Passwords do not match");
});

When(
	"I submit the form with a weak password",
	async ({ registerPage, user }) => {
		await registerPage.fillForm(user.email, "weakpassword");
		await registerPage.submit();
	},
);

Then("I see the password requirements", async ({ registerPage }) => {
	await registerPage.expectLoaded();
	await registerPage.expectError(
		"Password must be more than 8 characters and include upper, lower and special characters",
	);
});

Given("I have already created an account", async ({ authApi, user }) => {
	const response = await authApi.register(user);

	expect(response.status()).toBe(201);
});

When(
	"I submit the registration form with the same email address",
	async ({ registerPage, user }) => {
		await registerPage.goto();
		await registerPage.expectLoaded();
		await registerPage.fillForm(user.email, user.password);
		await registerPage.submit();
	},
);

Then(
	"I see a message that the email address is already in use",
	async ({ registerPage }) => {
		await registerPage.expectLoaded();
		await registerPage.expectError("Email already in use");
	},
);