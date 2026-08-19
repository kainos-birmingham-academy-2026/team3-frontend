import type { Locator, Page } from "@playwright/test";

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

	getApplicationReviewHeading(): Locator {
		return this.applicationReviewHeading;
	}

	async clickFirstHireButton(): Promise<void> {
		await this.firstHireButton.click();
	}

	async confirmHiring(): Promise<void> {
		await this.confirmButton.click();
	}

	getSuccessMessage(): Locator {
		return this.successMessage;
	}

	getPendingApplications(): Locator {
		return this.pendingApplications;
	}
}
