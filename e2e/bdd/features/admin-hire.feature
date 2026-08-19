@smoke

Feature: Admin Hiring applicant
	As an admin i want to be able to hire applicants whose applications are pending review
	thus in turn updating the status of their application from pending to hired

	Scenario: Successfully hire a pending applicant
		Given i have an admin account already registered
		When i login to my administrator account
		Then an application tab appears which takes me to the admin application portal
		Then on the applications table under the column labelled "Action"
		When i click on the hire button
		Then recieve a popup to confirm
		Then recieve a success message
		Then applicant status goes from pending -> hired.