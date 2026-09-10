/// <reference types="node" />
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);

describe("jobApplicationAdmin", () => {
	const viewData = {
		applications: [
			{
				applicationId: 12,
				applicantEmail: "alex@example.com",
				jobRoleId: 4,
				roleName: "Engineer",
				applicationDate: "2026-09-01",
				status: "pending",
				location: "Belfast",
			},
		],
		applicationCounts: {
			total: 36,
			pending: 20,
			approved: 8,
			rejected: 5,
			withdrawn: 3,
		},
		filters: { search: "", status: "", role: "", location: "" },
		jobRoles: [{ roleName: "Engineer", location: "Belfast" }],
	};

	it("renders application workflows as links and forms", () => {
		const html = environment.render("pages/jobApplicationAdmin.njk", viewData);

		expect(html).toContain('method="get" action="/job-applications/admin"');
		expect(html).toContain('href="/job-applications/12/cv"');
		expect(html).toContain('href="/job-applications/admin?clear=1"');
		expect(html).toContain('href="/job-role-list/4?from=admin-applications"');
		expect(html).toContain(
			'method="post" action="/job-applications/12/status"',
		);
		expect(html).toContain('name="action" value="approve"');
		expect(html).toContain('name="action" value="reject"');
	});

	it.each([viewData.applications, []])(
		"renders global summary counts independently of visible rows: %j",
		(applications) => {
			const html = environment.render("pages/jobApplicationAdmin.njk", {
				...viewData,
				applications,
			});

			expect(html).toContain('id="total-count">36</span>');
			expect(html).toContain('id="pending-count">20</span>');
			expect(html).toContain('id="hired-count">8</span>');
			expect(html).toContain('id="rejected-count">5</span>');
			expect(html).toContain('id="withdrawn-count">3</span>');
		},
	);

	it("only applies filters when the filter form is submitted", () => {
		const html = environment.render("pages/jobApplicationAdmin.njk", viewData);

		expect(html).toContain(
			'<button class="button button-solid" type="submit">Apply filters</button>',
		);
		expect(html).not.toContain('addEventListener("input", filterApplications)');
		expect(html).not.toContain(
			'addEventListener("change", filterApplications)',
		);
		expect(html).not.toContain("function filterApplications");
		expect(html).not.toContain("function loadApplications");
		expect(html).not.toContain("/api/job-applications/admin?page=");
	});
});
