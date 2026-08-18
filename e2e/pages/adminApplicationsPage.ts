import { expect, type Page } from '@playwright/test';

export class AdminApplicationsPage {
  constructor(private readonly page: Page) {}

  // Locators
  private getApplicationReviewHeading() {
    return this.page.getByRole('heading', { name: 'Application Review' });
  }

  private getFirstHireButton() {
    return this.page.locator('.btn-hire').first();
  }

  private getPendingApplications() {
    return this.page.locator('.status-pending');
  }

  private getConfirmButton() {
    return this.page.locator('#popup-confirm');
  }

  private getSuccessMessage() {
    return this.page.getByText('Applicant hired!');
  }

  // Methods
  async goto(): Promise<void> {
    await this.page.goto('/job-applications/admin');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.getApplicationReviewHeading()).toBeVisible();
  }

  async clickFirstHireButton(): Promise<void> {
    const hireButton = this.getFirstHireButton();
    await expect(hireButton).toBeVisible();
    await hireButton.click();
  }

  async confirmHiring(): Promise<void> {
    await this.getConfirmButton().click();
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.getSuccessMessage()).toBeVisible();
  }

  async confirmPendingApplicationExists(): Promise<void> {
    const pending = await this.getPendingApplications().count();
    expect(pending).toBeGreaterThan(0);
  }
}
