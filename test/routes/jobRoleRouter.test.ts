import express from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import path from "node:path";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import authRouter from "../../src/routes/authRouter";
import router from "../../src/routes/jobRoleRouter";
import type { RequestHandler } from "express";
import { AdminApplicationService } from "../../src/services/adminApplicationService";
import { JobRoleController } from "../../src/controllers/jobRoleController";

describe("routes", () => {
  const app = express();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

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

  it("should redirect unauthenticated users from create page to login", async () => {
    const response = await request(app).get("/job-role-create");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("should redirect unauthenticated users from job role detail page to login", async () => {
    const response = await request(app).get("/job-role-list/1");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });

  it("should allow ADMIN to access create page", async () => {
    const adminApp = express();

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    adminApp.use(router);

    const response = await request(adminApp).get("/job-role-create");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Create job role");
    expect(response.text).toContain('name="capabilityId"');
    expect(response.text).toContain('name="bandId"');
    expect(response.text).toContain('name="locationId"');
    expect(response.text).toContain('value="OPEN"');
  });

  it("should show access restricted page when USER accesses create page", async () => {
    const userApp = express();

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: userApp,
      noCache: true,
    });

    userApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    userApp.use(((req, _res, next) => {
      req.session.jwtToken = "user-token";
      req.session.userRole = "USER";
      next();
    }) as RequestHandler);

    userApp.use(router);

    const response = await request(userApp).get("/job-role-create");

    expect(response.status).toBe(403);
    expect(response.text).toContain("Access restricted");
    expect(response.text).toContain("You do not have permission to access this page.");
  });

  it("should render cv page for an existing application", async () => {
    const adminApp = express();

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "getAll").mockResolvedValueOnce([
      {
        applicationId: 10,
        applicantName: "A User",
        applicantEmail: "a@example.com",
        roleName: "Engineer",
        applicationDate: "2026-08-01",
        status: "pending",
        cvText: "Cached text",
      },
    ]);
    vi.spyOn(AdminApplicationService.prototype, "getCvTextById").mockResolvedValueOnce("Full CV text");

    adminApp.use(router);

    const response = await request(adminApp).get("/job-applications/10/cv");

    expect(response.status).toBe(200);
    expect(response.text).toContain("A User");
    expect(response.text).toContain("Full CV text");
  });

  it("should return 400 when cv page id is invalid", async () => {
    const adminApp = express();

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    adminApp.use(router);

    const response = await request(adminApp).get("/job-applications/not-a-number/cv");

    expect(response.status).toBe(400);
  });

  it("should return 404 when cv page application is not found", async () => {
    const adminApp = express();

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "getAll").mockResolvedValueOnce([]);
    adminApp.use(router);

    const response = await request(adminApp).get("/job-applications/999/cv");

    expect(response.status).toBe(404);
  });

  it("should return 500 when cv page loading fails", async () => {
    const adminApp = express();

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "getAll").mockRejectedValueOnce(new Error("boom"));
    adminApp.use(router);

    const response = await request(adminApp).get("/job-applications/10/cv");

    expect(response.status).toBe(500);
  });

  it("should return cv text payload from api route", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "getCvTextById").mockResolvedValueOnce("Server CV");
    adminApp.use(router);

    const response = await request(adminApp).get("/api/job-applications/12/cv-text");

    expect(response.status).toBe(200);
    expect(response.body.cvText).toBe("Server CV");
  });

  it("should return 400 for invalid cv-text api id", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    adminApp.use(router);

    const response = await request(adminApp).get("/api/job-applications/not-a-number/cv-text");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid application ID");
  });

  it("should return axios error response from cv-text route", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "getCvTextById").mockRejectedValueOnce({
      isAxiosError: true,
      message: "axios fail",
      response: { status: 409, data: { error: "Conflict" } },
    });
    adminApp.use(router);

    const response = await request(adminApp).get("/api/job-applications/12/cv-text");

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("Conflict");
  });

  it("should return generic error from cv-text route", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "getCvTextById").mockRejectedValueOnce(new Error("bad"));
    adminApp.use(router);

    const response = await request(adminApp).get("/api/job-applications/12/cv-text");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("bad");
  });

  it("should route /job-applications/admin to controller", async () => {
    const adminApp = express();

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(JobRoleController.prototype, "getApplications").mockImplementationOnce(async (_req, res) => {
      res.status(200).send("ok");
    });
    adminApp.use(router);

    const response = await request(adminApp).get("/job-applications/admin");

    expect(response.status).toBe(200);
    expect(response.text).toContain("ok");
  });

  it("should return applications list for admin api route", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "getAll").mockResolvedValueOnce([
      {
        applicationId: 1,
        applicantName: "A",
        applicantEmail: "a@example.com",
        roleName: "Engineer",
        applicationDate: "2026-08-01",
        status: "pending",
      },
    ]);

    adminApp.use(router);

    const response = await request(adminApp).get("/api/job-applications/admin");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should return 500 for admin api list failures", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "getAll").mockRejectedValueOnce(new Error("list failed"));
    adminApp.use(router);

    const response = await request(adminApp).get("/api/job-applications/admin");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("list failed");
  });

  it("should return 400 for invalid approve id", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    adminApp.use(router);

    const response = await request(adminApp).post("/api/job-applications/not-a-number/approve");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid application ID");
  });

  it("should approve application successfully", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "approve").mockResolvedValueOnce();
    adminApp.use(router);

    const response = await request(adminApp).post("/api/job-applications/22/approve");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should return axios error from approve route", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "approve").mockRejectedValueOnce({
      isAxiosError: true,
      message: "approve fail",
      response: { status: 409, data: { error: "Already approved" } },
    });
    adminApp.use(router);

    const response = await request(adminApp).post("/api/job-applications/22/approve");

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("Already approved");
  });

  it("should return generic error from approve route", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "approve").mockRejectedValueOnce(new Error("approve error"));
    adminApp.use(router);

    const response = await request(adminApp).post("/api/job-applications/22/approve");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("approve error");
  });

  it("should return 400 for invalid reject id", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    adminApp.use(router);

    const response = await request(adminApp).post("/api/job-applications/not-a-number/reject");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid application ID");
  });

  it("should reject application successfully", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "reject").mockResolvedValueOnce();
    adminApp.use(router);

    const response = await request(adminApp).post("/api/job-applications/22/reject");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should return axios error from reject route", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "reject").mockRejectedValueOnce({
      isAxiosError: true,
      message: "reject fail",
      response: { status: 409, data: { error: "Already rejected" } },
    });
    adminApp.use(router);

    const response = await request(adminApp).post("/api/job-applications/22/reject");

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("Already rejected");
  });

  it("should return generic error from reject route", async () => {
    const adminApp = express();
    adminApp.use(express.json());

    nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
      autoescape: true,
      express: adminApp,
      noCache: true,
    });

    adminApp.use(
      session({
        secret: "test-session-secret",
        resave: false,
        saveUninitialized: false,
      }),
    );

    adminApp.use(((req, _res, next) => {
      req.session.jwtToken = "admin-token";
      req.session.userRole = "ADMIN";
      next();
    }) as RequestHandler);

    vi.spyOn(AdminApplicationService.prototype, "reject").mockRejectedValueOnce(new Error("reject error"));
    adminApp.use(router);

    const response = await request(adminApp).post("/api/job-applications/22/reject");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("reject error");
  });
});

