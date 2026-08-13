import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("application received confirmation", () => {
	it("should render confirmation content and back-to-details link", () => {
		const html = environment.render("pages/applicationReceivedConfirmation.njk", {
			currentPath: "/job-role-list/3/apply/confirmation",
			jobRoleId: "3",
		});

		expect(html).toContain("Application received");
		expect(html).toContain("Your application has been submitted successfully");
		expect(html).toContain('href="/job-role-list/3"');
		expect(html).toContain("Back to job details");
	});
});
