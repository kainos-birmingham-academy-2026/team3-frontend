import { expect, test } from "@playwright/test";

test.describe("Registration password usability", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/register");
	});

	test("updates password requirements as the user types", async ({ page }) => {
		const password = page.getByLabel("Password", { exact: true });
		const confirmPassword = page.locator("#confirmPassword");
		const requirements = page.locator("[data-password-rule]");
		const matchingRequirement = page.locator('[data-password-rule="matching"]');

		await expect(requirements).toHaveCount(4);
		for (const requirement of await requirements.all()) {
			await expect(requirement).toHaveAttribute("data-met", "false");
		}

		await password.fill("Password!");

		for (let index = 0; index < 3; index += 1) {
			await expect(requirements.nth(index)).toHaveAttribute("data-met", "true");
		}
		await expect(matchingRequirement).toHaveAttribute("data-met", "false");

		await confirmPassword.fill("Different!");
		await expect(matchingRequirement).toHaveAttribute("data-met", "false");

		await confirmPassword.fill("Password!");
		await expect(matchingRequirement).toHaveAttribute("data-met", "true");
		await expect(requirements.locator(".requirement-icon")).toHaveText([
			"✓",
			"✓",
			"✓",
			"✓",
		]);
	});

	test("shows and hides each password field independently", async ({
		page,
	}) => {
		const password = page.getByLabel("Password", { exact: true });
		const confirmPassword = page.locator("#confirmPassword");
		const passwordToggle = page.locator('[aria-controls="password"]');

		await passwordToggle.click();

		await expect(password).toHaveAttribute("type", "text");
		await expect(confirmPassword).toHaveAttribute("type", "password");
		await expect(passwordToggle).toHaveAccessibleName("Hide password");
		await expect(passwordToggle).toHaveAttribute("aria-pressed", "true");
		await expect(
			passwordToggle.locator(".password-toggle-slash"),
		).toBeVisible();

		await passwordToggle.click();
		await expect(password).toHaveAttribute("type", "password");
		await expect(passwordToggle).toHaveAccessibleName("Show password");
		await expect(passwordToggle.locator(".password-toggle-slash")).toBeHidden();
	});
});
