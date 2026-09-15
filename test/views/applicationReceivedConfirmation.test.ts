import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("application received confirmation", () => {
	it("should render confirmation content with a link to job roles", () => {
		const html = environment.render(
			"pages/applicationReceivedConfirmation.njk",
			{
				currentPath: "/job-role-list/3/apply/confirmation",
				jobRoleId: "3",
				jobRoleListUrl: "/job-role-list?roleName=Engineer&locationId=2&page=3",
			},
		);

		expect(html).toContain("Application received");
		expect(html).toContain("Your application has been submitted successfully");
		expect(html).toContain(
			'href="/job-role-list?roleName=Engineer&amp;locationId=2&amp;page=3"',
		);
		expect(html).toContain("Back to job roles");
		expect(html).not.toContain('href="/job-applications"');
		expect(html).not.toContain("Back to job details");
	});
});
