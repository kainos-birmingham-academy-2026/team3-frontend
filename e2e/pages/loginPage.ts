import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
	private readonly url = "/login";
	private readonly title = /Kainos \| Sign in/;

	private readonly heading: Locator;
	private readonly emailField: Locator;
	private readonly passwordField: Locator;
	private readonly signInButton: Locator;
	private readonly createAccountLink: Locator;
	private readonly errorAlert: Locator;

	constructor(private readonly page: Page) {
		this.heading = page.getByRole("heading", { name: "Welcome back" });
		this.emailField = page.getByLabel("Email");
		this.passwordField = page.getByLabel("Password");
		this.signInButton = page.getByRole("button", { name: "Sign in" });
		this.createAccountLink = page.getByRole("link", {
			name: "Create an account",
		});
		this.errorAlert = page.getByRole("alert");
	}

	async goto(): Promise<void> {
		await this.page.goto(this.url);
	}

	async expectLoaded(): Promise<void> {
		await expect(this.page).toHaveURL(/\/login$/);
		await expect(this.page).toHaveTitle(this.title);
		await expect(this.heading).toBeVisible();
	}

	async expectFormFields(): Promise<void> {
		await expect(this.emailField).toBeVisible();
		await expect(this.passwordField).toBeVisible();
		await expect(this.signInButton).toBeVisible();
	}

	async clickCreateAccount(): Promise<void> {
		await this.createAccountLink.click();
	}

	async signIn(email: string, password: string): Promise<void> {
		await this.emailField.fill(email);
		await this.passwordField.fill(password);
		await this.signInButton.click();
	}

	async expectError(message: string): Promise<void> {
		await expect(this.errorAlert).toHaveText(message);
	}
}
