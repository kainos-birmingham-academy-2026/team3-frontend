import { expect, test } from '../fixtures/test';

test.describe('Admin hiring workflow', { tag: '@admin' }, () => {
  test.beforeAll(async () => {
    // Reset database to ensure fresh state
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('npx prisma migrate reset --force', {
        cwd: process.cwd(),
      });
      
      await execAsync('npx prisma db seed', {
        cwd: process.cwd(),
      });
    } catch (error) {
      console.warn('Database reset/seed warning:', error);
    }
  });

  test('successfully hire an applicant', { skip: !!process.env.CI }, async ({
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