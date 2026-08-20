@backend
Feature: Account registration
  As a job applicant
  I want to understand when my account details are incomplete
  So that I can provide the information needed to create an account

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

  Scenario: An applicant registers with an email already in use
    Given I have already created an account
    When I submit the registration form with the same email address
    Then I see a message that the email address is already in use