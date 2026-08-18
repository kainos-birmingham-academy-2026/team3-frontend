import { expect, test } from "../fixtures/test";

test.describe("Public route smoke tests", { tag: "@smoke" }, () => {
	test("home page renders core hero and actions", async ({ homePage }) => {
		await homePage.goto();
		await homePage.expectLoaded();
		await homePage.expectPrimaryActions();
	});

	test("login page renders sign-in form fields", async ({ loginPage }) => {
		await loginPage.goto();
		await loginPage.expectLoaded();
		await loginPage.expectFormFields();
	});

	test("register page renders create-account form fields", async ({
		registerPage,
	}) => {
		await registerPage.goto();
		await registerPage.expectLoaded();
		await registerPage.expectFormFields();
	});

	test("unauthorised route returns 401 page", async ({ page }) => {
		const response = await page.goto("/unauthorised");
		expect(response?.status()).toBe(401);
		await expect(
			page.getByRole("heading", { name: "Sign in required" }),
		).toBeVisible();
	});

	test("unknown route returns 404 page", async ({ page }) => {
		const response = await page.goto("/this-route-does-not-exist");
		expect(response?.status()).toBe(404);
		await expect(
			page.getByRole("heading", { name: "Page Not Found" }),
		).toBeVisible();
	});

	test("health endpoint returns UP json payload", async ({ request }) => {
		const response = await request.get("/health");
		expect(response.ok()).toBeTruthy();

		const body = await response.json();
		expect(body.status).toBe("UP");
		expect(Number.isNaN(Date.parse(String(body.time)))).toBeFalsy();
	});
});

test("home header sign-in link navigates to login @smoke", async ({
	homePage,
	loginPage,
}) => {
	await homePage.goto();
	await homePage.clickSignIn();
	await loginPage.expectLoaded();
});
