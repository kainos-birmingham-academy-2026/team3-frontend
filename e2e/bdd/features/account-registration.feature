@backend
Feature: Account registration
  As a job applicant
  I want to understand when my account details are incomplete
  So that I can provide the information needed to create an account

  Scenario: An applicant registers successfully with valid account details
    Given I am a signed-out visitor
    When I create an account with valid credentials
    Then my account should have been created successfully

  Scenario: An applicant signs in after registering successfully
    Given I am a signed-out visitor
    When I create an account with valid credentials
    Then my account should have been created successfully
    When I sign in with my new account
    Then I should be signed in successfully

  Scenario: An applicant submits incomplete registration details
    Given I am on the registration page
    When I submit the form without the required account details
    Then I see a message asking me to enter an email, password and password confirmation

  Scenario: An applicant enters different passwords
    Given I am on the registration page
    When I submit the form with different passwords
    Then I see a message that my passwords do not match

  Scenario: An applicant enters a weak password
    Given I am on the registration page
    When I submit the form with a weak password
    Then I see the password requirements

  Scenario: An applicant enters an invalid email format
    Given I am on the registration page
    When I submit the form with an invalid email format
    Then I see a message that my email or password format is invalid

  Scenario: An applicant registers with an email already in use
    Given I have already created an account
    When I submit the registration form with the same email address
    Then I see a message that the email address is already in use