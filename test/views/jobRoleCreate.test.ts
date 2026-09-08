/// <reference types="node" />
import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const templatePath = path.resolve(
	process.cwd(),
	"src/views/pages/jobRoleCreate.njk",
);
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);

function renderView(jobRole = {}): string {
	if (!template.length) {
		throw new Error("Template should not be empty");
	}

	return environment.render("pages/jobRoleCreate.njk", {
		canCreate: true,
		jobRole,
		capabilityOptions: [{ capabilityId: 1, capabilityName: "Engineering" }],
		bandOptions: [{ bandId: 2, bandName: "Engineer" }],
		locationOptions: [{ locationId: 3, locationName: "Birmingham" }],
		statusOptions: [{ statusId: 4, statusName: "OPEN" }],
	});
}

describe("jobRoleCreate", () => {
	it("should render the create form fields and dropdown options", () => {
		const html = renderView();

		expect(html).toContain('<form method="post" action="/job-role-create"');
		expect(html).toContain('name="roleName"');
		expect(html).toContain('name="description"');
		expect(html).toContain('name="responsibilities"');
		expect(html).toContain('name="sharepointUrl"');
		expect(html).toContain('name="numberOfOpenPositions"');
		expect(html).toContain('name="closingDate"');
		expect(html).toContain('name="capabilityId"');
		expect(html).toContain('value="1">Engineering</option>');
		expect(html).toContain('value="2">Engineer</option>');
		expect(html).toContain('value="3">Birmingham</option>');
	});

	it("should keep status fixed to OPEN and allow an optional closing date", () => {
		const html = renderView();

		expect(html).toContain('name="statusName"');
		expect(html).toContain('value="OPEN" readonly');
		expect(html).toContain(
			"If no closing date is set, the role will remain open until manually closed.",
		);
		expect(html).not.toContain('name="statusId"');
	});

	it("should preserve submitted values when the form is re-rendered", () => {
		const html = renderView({
			roleName: "Software Engineer",
			description: "Build & maintain services",
			responsibilities: "Design and test systems",
			sharepointUrl: "https://example.com/jobs/software-engineer",
			numberOfOpenPositions: "2",
			closingDate: "2026-12-31",
			capabilityId: "1",
			bandId: "2",
			locationId: "3",
		});

		expect(html).toContain('value="Software Engineer"');
		expect(html).toContain("Build &amp; maintain services");
		expect(html).toContain("Design and test systems");
		expect(html).toContain(
			'value="https://example.com/jobs/software-engineer"',
		);
		expect(html).toContain('value="2" min="1"');
		expect(html).toContain('value="2026-12-31"');
		expect(html).toContain('value="1" selected>Engineering</option>');
		expect(html).toContain('value="2" selected>Engineer</option>');
		expect(html).toContain('value="3" selected>Birmingham</option>');
	});
});
