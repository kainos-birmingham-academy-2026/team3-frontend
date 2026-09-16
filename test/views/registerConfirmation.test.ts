import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader("src/views"),
);

describe("register confirmation", () => {
	it("should render the verification code form", () => {
		const html = environment.render("pages/registerConfirmation.njk", {
			formValues: { verificationCode: "" },
			currentPath: "/register/confirmation",
		});

		expect(html).toContain("Check your email");
		expect(html).toContain('action="/register/confirmation"');
		expect(html).toContain('name="verificationCode"');
		expect(html).toContain("Continue to sign in");
		expect(html).not.toContain(">Home<");
		expect(html).not.toContain(">Job roles<");
	});
});
