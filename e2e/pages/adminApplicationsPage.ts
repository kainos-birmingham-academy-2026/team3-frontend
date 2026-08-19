import { expect, type Locator, type Page } from "@playwright/test";

export class AdminApplicationsPage {
	private readonly applicationReviewHeading: Locator;
	private readonly firstHireButton: Locator;
	private readonly pendingApplications: Locator;
	private readonly confirmButton: Locator;
	private readonly successMessage: Locator;

	constructor(private readonly page: Page) {
		this.applicationReviewHeading = page.getByRole("heading", {
			name: "Application Review",
		});
		this.firstHireButton = page.locator(".btn-hire").first();
		this.pendingApplications = page.locator(".status-pending");
		this.confirmButton = page.locator("#popup-confirm");
		this.successMessage = page.getByText("Applicant hired!");
	}

	// Methods
	async goto(): Promise<void> {
		await this.page.goto("/job-applications/admin");
	}

	async expectLoaded(): Promise<void> {
		await expect(this.applicationReviewHeading).toBeVisible();
	}

	async clickFirstHireButton(): Promise<void> {
		await expect(this.firstHireButton).toBeVisible();
		await this.firstHireButton.click();
	}

	async confirmHiring(): Promise<void> {
		await this.confirmButton.click();
	}

	async expectSuccessMessage(): Promise<void> {
		await expect(this.successMessage).toBeVisible();
	}

	async confirmPendingApplicationExists(): Promise<void> {
		const pending = await this.pendingApplications.count();
		expect(pending).toBeGreaterThan(0);
	}
}
