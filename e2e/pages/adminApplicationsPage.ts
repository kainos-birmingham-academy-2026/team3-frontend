import { expect, type Page } from '@playwright/test';

export class AdminApplicationsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/job-applications/admin');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Application Review' })).toBeVisible();
  }

  async clickFirstHireButton(): Promise<void> {
    const hireButton = this.page.locator('.btn-hire').first();
    await expect(hireButton).toBeVisible();
    await hireButton.click();
  }

  async confirmHiring(): Promise<void> {
    await this.page.locator('#popup-confirm').click();
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.page.getByText('Applicant hired!'));
  }

  async confirmPendingApplicationExists(): Promise<void> {
    const pending = await this.page.locator('.status-pending').count();
    expect(pending).toBeGreaterThan(0);
  }
}
