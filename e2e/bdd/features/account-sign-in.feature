@backend
Feature: Account sign-in
  As a job applicant
  I want to understand when my sign-in details are incomplete
  So that I can provide the information needed to access the job portal

  Scenario: An applicant submits incomplete sign-in details
    Given I am on the sign-in page
    When I submit the form without sign-in details
    Then I see a message asking me to enter an email and password

  Scenario: An applicant enters unrecognised sign-in details
    Given I am on the sign-in page
    When I submit the form with unrecognised sign-in details
    Then I see a message that my email or password is invalid

  Scenario: An authenticated applicant visits the sign-in page
    Given I have signed in to my account
    When I visit the sign-in page
    Then I am returned to the home page