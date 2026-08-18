import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const templatePath = path.resolve(process.cwd(), "src/views/pages/login.njk");
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);

type LoginRenderData = {
	formValues: { email: string };
	errorMessage?: string;
	currentPath?: string;
};

function renderView(data: LoginRenderData): string {
	if (!template.length) {
		throw new Error("Template should not be empty");
	}

	return environment.render("pages/login.njk", data);
}

describe("login", () => {
	it("should render sign in form with submitted email", () => {
		const html = renderView({
			formValues: { email: "jane.doe@example.com" },
			currentPath: "/login",
		});

		expect(html).toContain("Sign in to view job opportunities");
		expect(html).toContain('action="/login"');
		expect(html).toContain('name="email"');
		expect(html).toContain('autocomplete="email"');
		expect(html).toContain('value="jane.doe@example.com"');
		expect(html).toContain('type="password"');
		expect(html).not.toContain(">Home<");
		expect(html).not.toContain(">Job roles<");
		expect(html).not.toContain("header-cta");
	});

	it("should show an error message when provided", () => {
		const html = renderView({
			formValues: { email: "" },
			errorMessage: "Enter both email and password",
			currentPath: "/login",
		});

		expect(html).toContain("Enter both email and password");
		expect(html).toContain('role="alert"');
	});
});
