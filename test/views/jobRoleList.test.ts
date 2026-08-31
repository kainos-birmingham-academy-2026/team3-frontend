/// <reference types="node" />
import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";
import type { JobRole } from "../../src/models/jobRole";

const templatePath = path.resolve(
	process.cwd(),
	"src/views/pages/jobRoleList.njk",
);
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);

function renderView(
	jobRoles: JobRole[],
	currentUserRole?: string,
	context: Record<string, unknown> = {},
): string {
	if (!template.length) {
		throw new Error("Template should not be empty");
	}

	return environment.render("pages/jobRoleList.njk", {
		jobRoles,
		currentUserRole,
		...context,
	});
}

describe("jobRoleList", () => {
	it("should show open role details and hide non-open role details", () => {
		const jobRoles: JobRole[] = [
			{
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Birmingham",
				capability: "Software Engineering",
				band: "Engineer",
				closingDate: "2026-08-06",
				status: "open",
			},
			{
				jobRoleId: 2,
				roleName: "Delivery Manager",
				location: "Leeds",
				capability: "Delivery Management",
				band: "Senior Engineer",
				closingDate: "2026-09-01",
				status: "closed",
			},
		];

		const html = renderView(jobRoles);

		expect(html).toContain("Software Engineer");
		expect(html).toContain('data-href="/job-role-list/1"');
		expect(html).toContain('class="job-role-row-link"');
		expect(html).not.toContain("Delivery Manager");
		expect(html).not.toContain("No open job roles found");
	});

	it("should show empty-state message when there are no open roles", () => {
		const jobRoles: JobRole[] = [
			{
				jobRoleId: 2,
				roleName: "Delivery Manager",
				location: "Leeds",
				capability: "Delivery Management",
				band: "Senior Engineer",
				closingDate: "2026-09-01",
				status: "closed",
			},
		];

		const html = renderView(jobRoles);

		expect(html).toContain("No open job roles found");
		expect(html).not.toContain("Delivery Manager");
	});

	it("should show create action for admins", () => {
		const html = renderView(
			[
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					location: "Birmingham",
					capability: "Engineering",
					band: "Engineer",
					closingDate: "2099-12-31",
					status: "open",
				},
			],
			"ADMIN",
		);

		expect(html).toContain('href="/job-role-create"');
		expect(html).toContain("Create new role");
		expect(html).not.toContain("<th>Actions</th>");
		expect(html).not.toContain('href="/job-role-edit/1"');
		expect(html).not.toContain("delete-role-trigger");
	});

	it("should hide create action for non-admin users", () => {
		const html = renderView([], "USER");

		expect(html).not.toContain('href="/job-role-create"');
		expect(html).not.toContain("Create new role");
	});

	it("should support mouse and keyboard row navigation", () => {
		const html = renderView([]);

		expect(html).toContain('row.addEventListener("click", navigateToRole)');
		expect(html).toContain('event.key === "Enter" || event.key === " "');
	});

	it("should render filters for every displayed column and retain selections", () => {
		const html = renderView([], undefined, {
			filters: {
				roleName: "Engineer",
				closingFrom: "2026-09-01",
				closingBy: "2026-12-31",
			},
			locationOptions: [{ locationId: 1, locationName: "Birmingham" }],
			capabilityOptions: [{ capabilityId: 2, capabilityName: "Engineering" }],
			bandOptions: [{ bandId: 3, bandName: "Senior" }],
			selectedLocationIds: { 1: true },
			selectedCapabilityIds: { 2: true },
			selectedBandIds: { 3: true },
		});

		expect(html).toContain('name="roleName" type="text" value="Engineer"');
		expect(html).toContain('name="locationId"');
		expect(html).toContain('name="capabilityId"');
		expect(html).toContain('name="bandId"');
		expect(html).toContain('name="closingFrom" type="date" value="2026-09-01"');
		expect(html).toContain('name="closingBy" type="date" value="2026-12-31"');
		expect(html.match(/checked/g)).toHaveLength(3);
	});
});
