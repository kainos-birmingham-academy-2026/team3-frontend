@smoke @backend

Feature: Admin hiring applicant
	As an administrator
	I want to hire applicants whose applications are pending review
	So that their status is updated appropriately

	Scenario: Successfully hire a pending applicant
		Given I am logged in as an administrator
		When I review a pending application
		And I hire the applicant
		Then the applicant status should change from pending to hired