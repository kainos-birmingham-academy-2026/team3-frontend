import { expect, type Page } from '@playwright/test';

export class HomePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Kainos \| Home/);
    await expect(
      this.page.getByRole('heading', {
        name: 'True partners change the world together',
      }),
    ).toBeVisible();
  }

  async expectPrimaryActions(): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'View job roles' })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Contact us' })).toBeVisible();
  }

  async expectSignedOut(): Promise<void> {
    await expect(this.page.getByRole('link', { name: 'Sign in' })).toBeVisible();
    await expect(this.page.locator('#logout-trigger')).toHaveCount(0);
  }

  async expectSignedIn(): Promise<void> {
    await expect(this.page.locator('#logout-trigger')).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Sign in' })).toHaveCount(0);
  }

  async clickSignIn(): Promise<void> {
    await this.page.getByRole('link', { name: 'Sign in' }).click();
  }
}
