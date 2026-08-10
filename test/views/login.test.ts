import fs from "node:fs";
import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const templatePath = path.resolve(process.cwd(), "src/views/pages/login.njk");
const template = fs.readFileSync(templatePath, "utf8");
const viewsPath = path.resolve(process.cwd(), "src/views");
const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader(viewsPath));

type LoginRenderData = {
  formValues: { username: string };
  errorMessage?: string;
};

function renderView(data: LoginRenderData): string {
  if (!template.length) {
    throw new Error("Template should not be empty");
  }

  return environment.render("pages/login.njk", data);
}

describe("login", () => {
  it("should render sign in form with submitted username", () => {
    const html = renderView({
      formValues: { username: "jane.doe" },
    });

    expect(html).toContain("Sign in to access job role listings");
    expect(html).toContain('action="/login"');
    expect(html).toContain('value="jane.doe"');
    expect(html).toContain('type="password"');
  });

  it("should show an error message when provided", () => {
    const html = renderView({
      formValues: { username: "" },
      errorMessage: "Enter both username and password",
    });

    expect(html).toContain("Enter both username and password");
    expect(html).toContain('role="alert"');
  });
});
