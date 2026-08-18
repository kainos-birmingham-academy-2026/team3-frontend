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
}
