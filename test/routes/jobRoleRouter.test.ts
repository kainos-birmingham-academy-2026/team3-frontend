import express from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import path from "node:path";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import authRouter from "../../src/routes/authRouter";
import router from "../../src/routes/jobRoleRouter";

describe("routes", () => {
  const app = express();

  beforeAll(() => {
    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: app,
      noCache: true,
    });

    app.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

		app.use(authRouter);
    app.use(router);
  });

  it("should return 200 status code and branded home page", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Kainos");
    expect(response.text).toContain("True partners change the world together");
  });

  it("should return 200 status code and service status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("UP");
    expect(typeof response.body.time).toBe("string");
    expect(Number.isNaN(Date.parse(response.body.time))).toBe(false);
  });

  it("should return 200 for register page", async () => {
    const response = await request(app).get("/register");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Create your account");
  });

  it("should redirect unauthenticated users from job role list to login", async () => {
    const response = await request(app).get("/job-role-list");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });
});

