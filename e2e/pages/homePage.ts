import { expect, type Locator, type Page } from "@playwright/test";

export class HomePage {
	private readonly url = "/";
	private readonly title = /Kainos \| Home/;

	private readonly heading: Locator;
	private readonly viewJobRolesLink: Locator;
	private readonly contactUsLink: Locator;
	private readonly signInLink: Locator;
	private readonly signOutTrigger: Locator;

	constructor(private readonly page: Page) {
		this.heading = page.getByRole("heading", {
			name: "True partners change the world together",
		});
		this.viewJobRolesLink = page.getByRole("link", { name: "View job roles" });
		this.contactUsLink = page.getByRole("link", { name: "Contact us" });
		this.signInLink = page.getByRole("link", { name: "Sign in" });
		this.signOutTrigger = page.locator("#logout-trigger");
	}

	async goto(): Promise<void> {
		await this.page.goto(this.url);
	}

	async expectLoaded(): Promise<void> {
		await expect(this.page).toHaveURL(/\/$/);
		await expect(this.page).toHaveTitle(this.title);
		await expect(this.heading).toBeVisible();
	}

	async expectPrimaryActions(): Promise<void> {
		await expect(this.viewJobRolesLink).toBeVisible();
		await expect(this.contactUsLink).toBeVisible();
	}

	async expectSignedOut(): Promise<void> {
		await expect(this.signInLink).toBeVisible();
		await expect(this.signOutTrigger).toHaveCount(0);
	}

	async expectSignedIn(): Promise<void> {
		await expect(this.signOutTrigger).toBeVisible();
		await expect(this.signInLink).toHaveCount(0);
	}

	async clickSignIn(): Promise<void> {
		await this.signInLink.click();
	}
}
