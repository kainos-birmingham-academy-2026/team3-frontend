/// <reference types="node" />
import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const templatePath = path.resolve(
	process.cwd(),
	"src/views/pages/jobRoleEdit.njk",
);
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);

function renderView(): string {
	if (!template.length) {
		throw new Error("Template should not be empty");
	}

	return environment.render("pages/jobRoleEdit.njk", {
		jobRole: {
			jobRoleId: 7,
			roleName: "Lead Engineer",
			description: "Lead delivery",
			responsibilities: "Coach engineers",
			jobSpecUrl: "https://example.com/spec",
			openPositions: 3,
			closingDate: "2099-12-31",
			capability: "Engineering",
			band: "Lead",
			location: "Birmingham",
		},
		capabilityOptions: [{ capabilityId: 1, capabilityName: "Engineering" }],
		bandOptions: [{ bandId: 2, bandName: "Lead" }],
		locationOptions: [{ locationId: 3, locationName: "Birmingham" }],
		minClosingDate: "2026-08-18",
	});
}

describe("jobRoleEdit", () => {
	it("should pre-populate editable fields and selected options", () => {
		const html = renderView();

		expect(html).toContain('action="/job-role-edit"');
		expect(html).toContain('name="jobRoleId" value="7"');
		expect(html).toContain('value="Lead Engineer"');
		expect(html).toContain("Lead delivery");
		expect(html).toContain("Coach engineers");
		expect(html).toContain('value="https://example.com/spec"');
		expect(html).toContain('value="1" selected');
		expect(html).toContain('value="2" selected');
		expect(html).toContain('value="3" selected');
	});

	it("should enforce browser validation constraints", () => {
		const html = renderView();

		expect(html).not.toContain("novalidate");
		expect(html).toContain('type="url" maxlength="255"');
		expect(html).toContain('type="number" min="1" step="1"');
		expect(html).toContain('type="date" min="2026-08-18"');
		expect(html).toContain('maxlength="100"');
	});
});
