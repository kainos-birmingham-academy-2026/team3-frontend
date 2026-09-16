import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);

describe("register", () => {
	it("renders password constraints with neutral initial guidance", () => {
		const html = environment.render("pages/register.njk", {
			formValues: { email: "" },
			currentPath: "/register",
		});

		expect(html).toContain('minlength="9"');
		expect(html).toContain(
			'pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{9,}"',
		);
		expect(html).toContain("novalidate");
		expect(html).not.toContain('data-met="false"');
		expect(html).toContain("<noscript>");
	});

	it("renders a five-digit registration verification form", () => {
		const html = environment.render("pages/registerVerification.njk", {
			formValues: { verificationCode: "" },
			currentPath: "/register/verify",
		});

		expect(html).toContain('action="/register/verify"');
		expect(html).toContain('name="verificationCode"');
		expect(html).toContain('pattern="[0-9]{5}"');
		expect(html).toContain('autocomplete="one-time-code"');
	});
});
