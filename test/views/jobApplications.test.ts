/// <reference types="node" />
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(viewsPath),
);

describe("jobApplications", () => {
	const application = {
		applicationId: 12,
		jobRoleId: 4,
		roleName: "Software Engineer",
		applicationDate: "2026-09-02",
		cvText: "Engineering CV",
	};

	it.each([
		["pending", "Under review", "What happens next", 'aria-current="step"'],
		["approved", "Under review", "Hired", "Application successful"],
		["rejected", "Under review", "Not selected", "Application closed"],
		["withdrawn", "Review ended", "Withdrawn", "Application withdrawn"],
	])(
		"renders clear progress for a %s application",
		(status, reviewLabel, outcomeLabel, outcomeDetail) => {
			const html = environment.render("pages/jobApplications.njk", {
				applications: [{ ...application, status }],
			});

			expect(html).toContain(
				'aria-label="Application progress for Software Engineer"',
			);
			expect(html).toContain('datetime="2026-09-02"');
			expect(html).toContain(reviewLabel);
			expect(html).toContain(outcomeLabel);
			expect(html).toContain(outcomeDetail);
		},
	);
});
