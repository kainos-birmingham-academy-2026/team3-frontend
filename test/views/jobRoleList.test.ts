import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";
import type { JobRole } from "../../src/models/jobRole";

const templatePath = path.resolve(process.cwd(), "src/views/pages/jobRoleList.njk");
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewsPath));

function renderView(jobRoles: JobRole[]): string {
  if (!template.length) {
    throw new Error("Template should not be empty");
  }

  return environment.render("pages/jobRoleList.njk", { jobRoles });
}

describe("jobRoleList", () => {
  it("should show open role details and hide non-open role details", () => {
    const jobRoles: JobRole[] = [
      {
        jobRoleId: 1,
        roleName: "Software Engineer",
        location: "Birmingham",
        capabilityId: 1,
        bandId: 5,
        closingDate: "2026-08-06",
        status: "open",
      },
      {
        jobRoleId: 2,
        roleName: "Delivery Manager",
        location: "Leeds",
        capabilityId: 2,
        bandId: 6,
        closingDate: "2026-09-01",
        status: "closed",
      },
    ];

    const html = renderView(jobRoles);

    expect(html).toContain("Software Engineer");
    expect(html).not.toContain("Delivery Manager");
    expect(html).not.toContain("No open job roles found");
  });

  it("should show empty-state message when there are no open roles", () => {
    const jobRoles: JobRole[] = [
      {
        jobRoleId: 2,
        roleName: "Delivery Manager",
        location: "Leeds",
        capabilityId: 2,
        bandId: 6,
        closingDate: "2026-09-01",
        status: "closed",
      },
    ];

    const html = renderView(jobRoles);

    expect(html).toContain("No open job roles found");
    expect(html).not.toContain("Delivery Manager");
  });
});
