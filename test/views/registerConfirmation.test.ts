import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("register confirmation", () => {
	it("should render registration success with a sign-in link", () => {
		const html = environment.render("pages/registerConfirmation.njk", {
			currentPath: "/register/confirmation",
		});

		expect(html).toContain("Registration successful");
		expect(html).toContain('href="/login"');
		expect(html).toContain("Go to sign in");
	});
});
