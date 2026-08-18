import { expect, mergeTests } from '@playwright/test';
import { authFixtures } from './auth';
import { homeFixtures } from './home';

export const test = mergeTests(authFixtures, homeFixtures);

export { expect };
