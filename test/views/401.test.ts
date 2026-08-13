import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("401 page", () => {
	it("should render title, message and sign in link", () => {
		const html = environment.render("pages/401.njk", {
			currentPath: "/unauthorised",
		});

		expect(html).toContain("Sign in required");
		expect(html).toContain("You need to sign in to view this page.");
		expect(html).toContain('href="/login"');
	});
});