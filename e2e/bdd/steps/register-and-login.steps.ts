import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test } from "../fixtures/test";

const { Given, When, Then } = createBdd(test);

Given("I am a signed-out visitor", async ({ homePage }) => {
	await homePage.goto();
	await homePage.expectLoaded();
	await homePage.expectSignedOut();
});

When(
	"I create an account with valid credentials",
	async ({ homePage, loginPage, registerPage, user }) => {
		await homePage.clickSignIn();
		await loginPage.expectLoaded();
		await loginPage.clickCreateAccount();
		await registerPage.expectLoaded();
		await registerPage.fillForm(user.email, user.password);
		await registerPage.submit();
	},
);

Then(
	"my account should have been created and I should be signed in",
	async ({ homePage, page }) => {
	await homePage.expectLoaded();
	await homePage.expectSignedIn();
	await expect(page).toHaveURL(/\/$/);
});
