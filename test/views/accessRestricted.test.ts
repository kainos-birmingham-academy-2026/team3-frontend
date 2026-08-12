import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("access restricted page", () => {
	it("should render title, message and back link", () => {
		const html = environment.render("pages/accessRestricted.njk", {
			currentPath: "/job-role-create",
		});

		expect(html).toContain("Access restricted");
		expect(html).toContain("You do not have permission to access this page.");
		expect(html).not.toContain("Requested page:");
		expect(html).toContain('href="/job-role-list"');
	});
});
