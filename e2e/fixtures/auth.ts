import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';
import { RegisterConfirmationPage } from '../pages/registerConfirmationPage';
import { RegisterPage } from '../pages/registerPage';
import { AdminApplicationsPage } from '../pages/adminApplicationsPage';

type AuthFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  registerConfirmationPage: RegisterConfirmationPage;
  adminApplicationsPage: AdminApplicationsPage;
};

export const authFixtures = base.extend<AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  registerConfirmationPage: async ({ page }, use) => {
    await use(new RegisterConfirmationPage(page));

  },
  adminApplicationsPage: async ({ page }, use) => {
    await use(new AdminApplicationsPage(page));
  },
});
