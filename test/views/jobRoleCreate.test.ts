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

function renderView(): string {
	if (!template.length) {
		throw new Error("Template should not be empty");
	}

	return environment.render("pages/jobRoleCreate.njk", {
		canCreate: true,
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
});
