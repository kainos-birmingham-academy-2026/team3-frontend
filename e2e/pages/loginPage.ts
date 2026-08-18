import { expect, type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Kainos \| Sign in/);
    await expect(this.page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  }

  async expectFormFields(): Promise<void> {
    await expect(this.page.getByLabel('Email')).toBeVisible();
    await expect(this.page.getByLabel('Password')).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  }
}