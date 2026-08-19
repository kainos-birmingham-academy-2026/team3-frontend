import type { Locator, Page } from "@playwright/test";

export class JobRoleListPage {
	private readonly url = "/job-role-list";
	private readonly heading: Locator;

	constructor(private readonly page: Page) {
		this.heading = page.getByRole("heading", { name: "Open job roles" });
	}

	async goto(): Promise<void> {
		await this.page.goto(this.url);
	}

	getHeading(): Locator {
		return this.heading;
	}

	getRoleRow(roleName: string): Locator {
		return this.page.getByRole("link", {
			name: `View details for ${roleName}`,
			exact: true,
		});
	}
}
