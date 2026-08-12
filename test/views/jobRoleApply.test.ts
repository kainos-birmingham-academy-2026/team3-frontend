/// <reference types="node" />
import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";
import type { JobRole } from "../../src/models/jobRole";

const templatePath = path.resolve(process.cwd(), "src/views/pages/jobRoleApply.njk");
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewsPath));

function renderView(jobRoleId: JobRole, errorMessage?: string): string {
  if (!template.length) {
    throw new Error("Template should not be empty");
  }

  return environment.render("pages/jobRoleApply.njk", {
    jobRoleId,
    errorMessage,
  });
}

describe("jobRoleApply", () => {
  it("should display upload form", () => {
    const jobRole: JobRole = {
      jobRoleId: 22,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      openPositions: 2,
    };

    const html = renderView(jobRole);

    expect(html).toContain("Upload your CV");
    expect(html).toContain('type="file"');
    expect(html).toContain('name="cv"');
    expect(html).toContain("Submit Application");
    expect(html).toContain('/job-role-list/22/apply');
  });

  it("should display error message when provided", () => {
    const jobRole: JobRole = {
      jobRoleId: 23,
      roleName: "QA Engineer",
      location: "Belfast",
      capability: "QA",
      band: "Engineer",
      closingDate: "2026-10-01",
      status: "open",
      openPositions: 1,
    };

    const html = renderView(jobRole, "Upload your CV before submitting your application.");

    expect(html).toContain("Upload your CV before submitting your application.");
  });
});
