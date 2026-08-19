// Generated from: e2e/bdd/features/register-and-login.feature
import { test } from "../../../../../bdd/fixtures/test.ts";

test.describe('Account registration and sign-in', () => {

  test('A new applicant registers and signs in', { tag: ['@smoke'] }, async ({ Given, When, Then, homePage, loginPage, page, registerConfirmationPage, registerPage, user }) => { 
    await Given('I am a signed-out visitor', null, { homePage }); 
    await When('I create an account with valid credentials', null, { homePage, loginPage, registerPage, user }); 
    await Then('my account should have been created successfully', null, { registerConfirmationPage }); 
    await When('I sign in with my new account', null, { loginPage, registerConfirmationPage, user }); 
    await Then('I should be signed in successfully', null, { homePage, page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/bdd/features/register-and-login.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":7,"tags":["@smoke"],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given I am a signed-out visitor","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":9,"keywordType":"Action","textWithKeyword":"When I create an account with valid credentials","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":10,"keywordType":"Outcome","textWithKeyword":"Then my account should have been created successfully","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":11,"keywordType":"Action","textWithKeyword":"When I sign in with my new account","stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":12,"keywordType":"Outcome","textWithKeyword":"Then I should be signed in successfully","stepMatchArguments":[]}]},
]; // bdd-data-end