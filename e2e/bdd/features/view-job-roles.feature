Feature: View open job roles
  As an applicant
  I want to view open job roles within Kainos
  So that I can see available opportunities

  Scenario: View available open job roles
    Given open and closed job roles are available
    When I view the job roles list
    Then I should see the available open job roles
    And I should not see closed job roles