import express from "express";
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import router from "../../src/routes/jobRoleRouter";

describe("routes", () => {
  const app = express();

  beforeAll(() => {
    app.use(router);
  });

  it("should return 200 status code and hello response string", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello, World!");
  });

  it("should return 200 status code and service status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("UP");
    expect(typeof response.body.time).toBe("string");
    expect(Number.isNaN(Date.parse(response.body.time))).toBe(false);
  });
});

