import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("account created", () => {
	it("should render sign-in navigation and the automatic redirect script", () => {
		const html = environment.render("pages/accountCreated.njk", {
			currentPath: "/register/success",
		});

		expect(html).toContain("Account successfully created");
		expect(html).toContain('href="/login"');
		expect(html).toContain('src="/scripts/accountCreated.js"');
	});
});
