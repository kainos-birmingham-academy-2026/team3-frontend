import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("application received confirmation", () => {
	it("should render confirmation content and a link to view applications", () => {
		const html = environment.render(
			"pages/applicationReceivedConfirmation.njk",
			{
				currentPath: "/job-role-list/3/apply/confirmation",
				jobRoleId: "3",
			},
		);

		expect(html).toContain("Application received");
		expect(html).toContain("Your application has been submitted successfully");
		expect(html).toContain('href="/job-applications"');
		expect(html).toContain("View your application");
		expect(html).not.toContain("Back to job details");
	});
});
