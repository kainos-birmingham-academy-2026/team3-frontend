import { expect, type Page } from '@playwright/test';

export class RegisterConfirmationPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/register\/confirmation$/);
    await expect(this.page).toHaveTitle(/Kainos \| Account created/);
    await expect(
      this.page.getByRole('heading', { name: 'Registration successful' }),
    ).toBeVisible();
  }

  async clickGoToSignIn(): Promise<void> {
    await this.page.getByRole('link', { name: 'Go to sign in' }).click();
  }
}
