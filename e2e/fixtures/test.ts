import { expect } from '@playwright/test';
import { authFixtures } from './auth';
import { HomePage } from '../pages/homePage';

type PageFixtures = {
  homePage: HomePage;
};

export const test = authFixtures.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect };
