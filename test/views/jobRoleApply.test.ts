import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const templatePath = path.resolve(process.cwd(), "src/views/pages/jobRoleApply.njk");
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewsPath));

type ApplyViewData = {
  canApply: boolean;
  errorMessage?: string;
  successMessage?: string;
  applicationStatus?: string;
  jobRoleId?: {
    jobRoleId: number;
    roleName: string;
    status: string;
  };
};

function renderView(data: ApplyViewData): string {
  if (!template.length) {
    throw new Error("Template should not be empty");
  }

  return environment.render("pages/jobRoleApply.njk", data);
}

describe("jobRoleApply", () => {
  it("should render CV text form when role can be applied for", () => {
    const html = renderView({
      canApply: true,
      jobRoleId: {
        jobRoleId: 3,
        roleName: "Lead Software Engineer",
        status: "open",
      },
    });

    expect(html).toContain("Submit your CV");
    expect(html).toContain('action="/job-role-list/3/apply"');
    expect(html).not.toContain('name="cvFile"');
    expect(html).toContain('name="cvText"');
    expect(html).toContain("textarea");
    expect(html).toContain("Submit Application");
  });

  it("should show success state with in progress status", () => {
    const html = renderView({
      canApply: true,
      successMessage: "Application submitted successfully.",
      applicationStatus: "in progress",
      jobRoleId: {
        jobRoleId: 3,
        roleName: "Lead Software Engineer",
        status: "open",
      },
    });

    expect(html).toContain("Application submitted successfully.");
    expect(html).toContain("Application status: In progress");
  });

  it("should hide form when role is not accepting applications", () => {
    const html = renderView({
      canApply: false,
      errorMessage: "This role is not currently accepting applications.",
      jobRoleId: {
        jobRoleId: 3,
        roleName: "Lead Software Engineer",
        status: "closed",
      },
    });

    expect(html).toContain("This role is not currently accepting applications.");
    expect(html).not.toContain("Submit Application");
  });
});
