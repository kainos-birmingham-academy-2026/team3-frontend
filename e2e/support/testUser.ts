import { randomUUID } from 'node:crypto';

export type TestUser = {
  email: string;
  password: string;
};

/** Password satisfies the backend policy: >8 characters with upper, lower and special. */
export function createTestUser(): TestUser {
  return {
    email: `e2e-${randomUUID()}@example.com`,
    password: 'Password123!',
  };
}
