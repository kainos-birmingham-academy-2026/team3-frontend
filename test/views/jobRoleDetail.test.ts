/// <reference types="node" />
import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";
import type { JobRole } from "../../src/models/jobRole";

const templatePath = path.resolve(process.cwd(), "src/views/pages/jobRoleDetail.njk");
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewsPath));

function renderView(jobRoleId: JobRole): string {
  if (!template.length) {
    throw new Error("Template should not be empty");
  }

  return environment.render("pages/jobRoleDetail.njk", { jobRoleId });
}

describe("jobRoleDetail", () => {
  it("should display job title and status badge", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Lead Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Senior Engineer",
      closingDate: "2026-08-06",
      status: "open",
    };

    const html = renderView(jobRole);

    expect(html).toContain("Lead Software Engineer");
    expect(html).toContain("Open");
    expect(html).toContain("Job Details");
  });

  it("should display job description section when available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      description: "We are looking for a talented Software Engineer to join our team",
    };

    const html = renderView(jobRole);

    expect(html).toContain("Job Description");
    expect(html).toContain("We are looking for a talented Software Engineer to join our team");
  });

  it("should not display job description section when not available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
    };

    const html = renderView(jobRole);

    expect(html).not.toContain("Job Description");
  });

  it("should display responsibilities section when available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      responsibilities: "Build and maintain software systems. Collaborate with team members.",
    };

    const html = renderView(jobRole);

    expect(html).toContain("Responsibilities");
    expect(html).toContain("Build and maintain software systems");
  });

  it("should display open positions count when available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      openPositions: 3,
    };

    const html = renderView(jobRole);

    expect(html).toContain("Open Positions");
    expect(html).toContain("3");
  });

  it("should not display open positions when not available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
    };

    const html = renderView(jobRole);

    expect(html).not.toContain("Open Positions");
  });

  it("should display job spec link when available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      jobSpecUrl: "https://sharepoint.com/jobs/engineer",
    };

    const html = renderView(jobRole);

    expect(html).toContain("Job Spec");
    expect(html).toContain("View in SharePoint");
    expect(html).toContain("https://sharepoint.com/jobs/engineer");
  });

  it("should not display job spec link when not available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
    };

    const html = renderView(jobRole);

    expect(html).not.toContain("Job Spec");
    expect(html).not.toContain("View in SharePoint");
  });

  it("should display address information when available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      addressLine1: "123 Business Street",
      addressLine2: "Suite 100",
      postcode: "B1 1AA",
    };

    const html = renderView(jobRole);

    expect(html).toContain("Address");
    expect(html).toContain("123 Business Street");
    expect(html).toContain("Suite 100");
    expect(html).toContain("B1 1AA");
  });

  it("should display address without line 2 when not available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      addressLine1: "123 Business Street",
      postcode: "B1 1AA",
    };

    const html = renderView(jobRole);

    expect(html).toContain("Address");
    expect(html).toContain("123 Business Street");
    expect(html).toContain("B1 1AA");
  });

  it("should display apply button when status is open and open positions are available", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      openPositions: 1,
    };

    const html = renderView(jobRole);

    expect(html).toContain("Apply Now");
    expect(html).toContain("/job-role-list/1/apply");
  });

  it("should hide apply button when status is open but no positions remain", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Engineer",
      closingDate: "2026-08-06",
      status: "open",
      openPositions: 0,
    };

    const html = renderView(jobRole);

    expect(html).not.toContain("Apply Now");
    expect(html).toContain("This position is currently closed");
  });

  it("should display closed status message when status is not open", () => {
    const jobRole: JobRole = {
      jobRoleId: 2,
      roleName: "Delivery Manager",
      location: "Leeds",
      capability: "Delivery Management",
      band: "Senior Engineer",
      closingDate: "2026-09-01",
      status: "closed",
    };

    const html = renderView(jobRole);

    expect(html).not.toContain("Apply Now");
    expect(html).toContain("This position is currently closed");
  });

  it("should display all job details fields inline with labels", () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: "Lead Software Engineer",
      location: "Birmingham",
      capability: "Software Engineering",
      band: "Senior Engineer",
      closingDate: "2026-08-06",
      status: "open",
    };

    const html = renderView(jobRole);

    expect(html).toContain("Role Name");
    expect(html).toContain("Lead Software Engineer");
    expect(html).toContain("Location");
    expect(html).toContain("Birmingham");
    expect(html).toContain("Band");
    expect(html).toContain("Senior Engineer");
    expect(html).toContain("Capability");
    expect(html).toContain("Software Engineering");
    expect(html).toContain("Closing Date");
    expect(html).toContain("2026-08-06");
  });
});
