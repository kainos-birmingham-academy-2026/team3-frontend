import { expect, type Page } from '@playwright/test';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/register');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveTitle(/Kainos \| Register/);
    await expect(this.page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
  }

  async expectFormFields(): Promise<void> {
    await expect(this.page.getByLabel('Email')).toBeVisible();
    await expect(this.page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(this.page.getByLabel('Confirm password')).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Create account' })).toBeVisible();
  }
}