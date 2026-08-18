import { expect, test } from '../fixtures/test';
import { apiBaseURL } from '../support/config';
import { deleteUserByEmail, findUserByEmail } from '../support/db';
import { createTestUser } from '../support/testUser';

test.describe('Register and sign-in journey', { tag: '@smoke' }, () => {
  const createdEmails: string[] = [];

  test.afterEach(async () => {
    for (const email of createdEmails.splice(0)) {
      await deleteUserByEmail(email);
    }
  });

  test('creates an account, stores a hashed password and signs in', async ({
    page,
    request,
    homePage,
    loginPage,
    registerPage,
    registerConfirmationPage,
  }) => {
    const user = createTestUser();
    const apiUser = createTestUser();
    createdEmails.push(user.email, apiUser.email);

    // The browser only ever sees the frontend redirect, so the 201 is asserted against the API directly.
    const registerResponse = await request.post(`${apiBaseURL}/api/register`, { data: apiUser });
    expect(registerResponse.status()).toBe(201);
    expect(await registerResponse.json()).toEqual({ message: 'User registered' });

    await homePage.goto();
    await homePage.expectLoaded();
    await homePage.expectSignedOut();

    await homePage.clickSignIn();
    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectLoaded();

    await loginPage.clickCreateAccount();
    await expect(page).toHaveURL(/\/register$/);
    await registerPage.expectLoaded();

    await registerPage.fillForm(user.email, user.password);
    await registerPage.submit();

    await expect(page).toHaveURL(/\/register\/confirmation$/);
    await registerConfirmationPage.expectLoaded();

    const storedUser = await findUserByEmail(user.email);
    expect(storedUser).not.toBeNull();
    expect(storedUser?.email).toBe(user.email);
    expect(storedUser?.role).toBe('USER');
    expect(storedUser?.passwordHash).toMatch(/^\$argon2id\$/);
    expect(storedUser?.passwordHash).not.toBe(user.password);

    await registerConfirmationPage.clickGoToSignIn();
    await expect(page).toHaveURL(/\/login$/);
    await loginPage.expectLoaded();

    // The token is held in the server-side session, so it is asserted against the API directly.
    const loginResponse = await request.post(`${apiBaseURL}/api/login`, { data: user });
    expect(loginResponse.status()).toBe(200);
    const { token } = await loginResponse.json();
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);

    await loginPage.signIn(user.email, user.password);

    await expect(page).toHaveURL(/\/$/);
    await homePage.expectLoaded();
    await homePage.expectSignedIn();
  });
});
