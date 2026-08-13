import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("logout confirmation", () => {
	it("should render sign-out confirmation content and sign in link", () => {
		const html = environment.render("pages/logoutConfirmation.njk", {
			currentPath: "/logout/confirmation",
		});

		expect(html).toContain("Signed out successfully");
		expect(html).toContain("You have been signed out of your account.");
		expect(html).toContain('href="/login"');
		expect(html).toContain("Go to sign in");
		expect(html).toContain(">Home<");
		expect(html).toContain(">Job roles<");
		expect(html).toContain("header-cta");
	});
});