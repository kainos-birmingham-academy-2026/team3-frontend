@smoke @backend
Feature: Account registration and sign-in
  As a job applicant
  I want to create an account and sign in
  So that I can access the job portal

  Scenario: A new applicant registers and signs in
    Given I am a signed-out visitor
    When I create an account with valid credentials
    Then my account should have been created successfully
    When I sign in with my new account
    Then I should be signed in successfully