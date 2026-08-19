import { expect, type Locator, type Page } from "@playwright/test";

export class JobRoleListPage {
	private readonly url = "/job-role-list";
	private readonly title = "Kainos Careers";
	private readonly heading: Locator;

	constructor(private readonly page: Page) {
		this.heading = page.getByRole("heading", { name: "Open job roles" });
	}

	async goto(): Promise<void> {
		await this.page.goto(this.url);
	}

	async expectLoaded(): Promise<void> {
		await expect(this.page).toHaveURL(/\/job-role-list$/);
		await expect(this.page).toHaveTitle(this.title);
		await expect(this.heading).toBeVisible();
	}

	async expectRoleVisible(roleName: string): Promise<void> {
		await expect(this.roleRow(roleName)).toBeVisible();
	}

	async expectRoleHidden(roleName: string): Promise<void> {
		await expect(this.roleRow(roleName)).toHaveCount(0);
	}

	private roleRow(roleName: string): Locator {
		return this.page.getByRole("link", {
			name: `View details for ${roleName}`,
			exact: true,
		});
	}
}
