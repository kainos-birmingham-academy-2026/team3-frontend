import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);
const template = fs.readFileSync(
	path.resolve(viewsPath, "layouts/header.njk"),
	"utf8",
);

function renderHeader(data: Record<string, unknown>): string {
	if (!template.length) {
		throw new Error("Template should not be empty");
	}

	return environment.render("layouts/header.njk", data);
}

describe("header", () => {
	it("renders navigation inside a no-JavaScript menu", () => {
		const html = renderHeader({ currentPath: "/" });

		expect(html).toContain(
			'<input class="header-menu-checkbox" type="checkbox" id="header-menu-toggle" />',
		);
		expect(html).toContain(
			'<label class="header-menu-toggle" for="header-menu-toggle">Menu</label>',
		);
		expect(html).toContain('aria-label="Main navigation"');
		expect(html).toContain('href="/login">Sign in</a>');
	});

	it("keeps authenticated navigation and sign out in the menu", () => {
		const html = renderHeader({
			currentPath: "/job-applications/admin",
			isAuthenticated: true,
			currentUserRole: "ADMIN",
			featureAdminHiringEnabled: true,
		});

		expect(html).toContain('href="/job-role-create">Create role</a>');
		expect(html).toContain(
			'href="/job-applications/admin">Applications</a>',
		);
		expect(html).toContain('href="/logout/confirmation"');
	});
});