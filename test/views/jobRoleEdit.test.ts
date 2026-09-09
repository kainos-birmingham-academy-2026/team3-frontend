/// <reference types="node" />
import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";
import { JOB_ROLE_CHARACTER_LIMITS } from "../../src/config/jobRoleValidation";

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
		characterLimits: JOB_ROLE_CHARACTER_LIMITS,
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

	it("should submit validation to the server while retaining input constraints", () => {
		const html = renderView();

		expect(html).toContain("novalidate");
		expect(html).toContain('type="url" maxlength="255"');
		expect(html).toContain('type="number" min="1" step="1"');
		expect(html).toContain('type="date" min="2026-08-18"');
		expect(html).toContain('maxlength="100"');
	});

	it("should mark required fields with an explained asterisk", () => {
		const html = renderView();
		const requiredLabels = [
			["roleName", "Role name"],
			["description", "Description"],
			["responsibilities", "Responsibilities"],
			["sharepointUrl", "Job specification URL"],
			["numberOfOpenPositions", "Number of open positions"],
			["capabilityId", "Capability"],
			["bandId", "Band"],
			["locationId", "Location"],
		];

		expect(html).toContain(
			'<p class="form-hint"><span aria-hidden="true">*</span> Required fields</p>',
		);
		for (const [fieldId, label] of requiredLabels) {
			expect(html).toContain(
				`<label for="${fieldId}">${label} <span aria-hidden="true">*</span></label>`,
			);
		}
		expect(html).toContain('<label for="closingDate">Closing date</label>');
	});

	it("should configure live character limits", () => {
		const html = renderView();

		expect(html).toContain(
			'maxlength="100" value="Lead Engineer" aria-describedby="roleName-character-count"',
		);
		expect(html).toContain('data-character-count-for="roleName"');
		expect(html).toContain(
			'rows="3" maxlength="2000" aria-describedby="description-character-count"',
		);
		expect(html).toContain('data-character-count-for="description"');
		expect(html).toContain(
			'rows="3" maxlength="2000" aria-describedby="responsibilities-character-count"',
		);
		expect(html).toContain('data-character-count-for="responsibilities"');
		expect(html).toContain(
			'maxlength="255" value="https://example.com/spec" aria-describedby="sharepointUrl-character-count"',
		);
		expect(html).toContain('data-character-count-for="sharepointUrl"');
		expect(html).toContain("/scripts/jobRoleCreate.js");
	});

	it("should show maximum character limits without JavaScript", () => {
		const html = renderView();

		expect(html).toContain(
			'data-character-count-for="roleName">Maximum 100 characters',
		);
		expect(html).toContain(
			'data-character-count-for="description">Maximum 2000 characters',
		);
		expect(html).toContain(
			'data-character-count-for="responsibilities">Maximum 2000 characters',
		);
		expect(html).toContain(
			'data-character-count-for="sharepointUrl">Maximum 255 characters',
		);
	});
});
