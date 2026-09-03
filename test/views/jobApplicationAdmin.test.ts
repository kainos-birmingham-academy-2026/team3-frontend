/// <reference types="node" />
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);

describe("jobApplicationAdmin", () => {
	it("renders application workflows as links and forms", () => {
		const html = environment.render("pages/jobApplicationAdmin.njk", {
			applications: [
				{
					applicationId: 12,
					applicantName: "Alex Example",
					applicantEmail: "alex@example.com",
					jobRoleId: 4,
					roleName: "Engineer",
					applicationDate: "2026-09-01",
					status: "pending",
					location: "Belfast",
				},
			],
			applicationCounts: { total: 1, pending: 1, approved: 0, rejected: 0 },
			filters: { search: "", status: "", role: "", location: "" },
			jobRoles: [{ roleName: "Engineer", location: "Belfast" }],
		});

		expect(html).toContain('method="get" action="/job-applications/admin"');
		expect(html).toContain('href="/job-applications/12/cv"');
		expect(html).toContain('href="/job-role-list/4"');
		expect(html).toContain(
			'method="post" action="/job-applications/12/status"',
		);
		expect(html).toContain('name="action" value="approve"');
		expect(html).toContain('name="action" value="reject"');
	});
});
