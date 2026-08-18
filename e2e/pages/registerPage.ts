import { expect, type Locator, type Page } from "@playwright/test";

export class RegisterPage {
	private readonly url = "/register";
	private readonly title = /Kainos \| Register/;

	private readonly heading: Locator;
	private readonly emailField: Locator;
	private readonly passwordField: Locator;
	private readonly confirmPasswordField: Locator;
	private readonly createAccountButton: Locator;

	constructor(private readonly page: Page) {
		this.heading = page.getByRole("heading", { name: "Create your account" });
		this.emailField = page.getByLabel("Email");
		// Exact match, otherwise this also resolves the confirm password field.
		this.passwordField = page.getByLabel("Password", { exact: true });
		this.confirmPasswordField = page.getByLabel("Confirm password");
		this.createAccountButton = page.getByRole("button", {
			name: "Create account",
		});
	}

	async goto(): Promise<void> {
		await this.page.goto(this.url);
	}

	async expectLoaded(): Promise<void> {
		await expect(this.page).toHaveURL(/\/register$/);
		await expect(this.page).toHaveTitle(this.title);
		await expect(this.heading).toBeVisible();
	}

	async expectFormFields(): Promise<void> {
		await expect(this.emailField).toBeVisible();
		await expect(this.passwordField).toBeVisible();
		await expect(this.confirmPasswordField).toBeVisible();
		await expect(this.createAccountButton).toBeVisible();
	}

	async fillForm(
		email: string,
		password: string,
		confirmPassword = password,
	): Promise<void> {
		await this.emailField.fill(email);
		await this.passwordField.fill(password);
		await this.confirmPasswordField.fill(confirmPassword);
	}

	async submit(): Promise<void> {
		await this.createAccountButton.click();
	}
}
