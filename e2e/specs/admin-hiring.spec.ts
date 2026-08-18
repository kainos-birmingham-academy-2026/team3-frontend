import { expect, test } from '../fixtures/test';

test.describe('Admin hiring workflow', { tag: '@admin' }, () => {
  test('successfully hire an applicant', async ({
    page,
    loginPage,
    adminApplicationsPage,
  }) => {
    await loginPage.goto();
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL(/^(?!.*login)/, { timeout: 5000 }).catch(() => {

    });

    await page.getByRole('link', { name: /applications/i }).click();
    await adminApplicationsPage.expectLoaded();

    await adminApplicationsPage.confirmPendingApplicationExists();

    await adminApplicationsPage.clickFirstHireButton();

    await adminApplicationsPage.confirmHiring();

    await adminApplicationsPage.expectSuccessMessage();
  });
});
