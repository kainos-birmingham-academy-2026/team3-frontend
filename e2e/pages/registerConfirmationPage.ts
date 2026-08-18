import { expect, type Locator, type Page } from '@playwright/test';

export class RegisterConfirmationPage {
  private readonly title = /Kainos \| Account created/;

  private readonly heading: Locator;
  private readonly goToSignInLink: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Registration successful' });
    this.goToSignInLink = page.getByRole('link', { name: 'Go to sign in' });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/register\/confirmation$/);
    await expect(this.page).toHaveTitle(this.title);
    await expect(this.heading).toBeVisible();
  }

  async clickGoToSignIn(): Promise<void> {
    await this.goToSignInLink.click();
  }
}
