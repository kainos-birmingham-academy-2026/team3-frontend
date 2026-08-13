import type { Server } from "node:http";
import path from "node:path";
import type { Application, RequestHandler } from "express";
import express from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import authRouter from "../../src/routes/authRouter";
import router from "../../src/routes/jobRoleRouter";

function createTestApp(): Application {
	const testApp = express();

	nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
		autoescape: true,
		express: testApp,
		noCache: true,
	});

	testApp.use(
		session({
			secret: "test-session-secret",
			resave: false,
			saveUninitialized: false,
		}),
	);

	testApp.use(authRouter);
	testApp.use(router);

	return testApp;
}

describe("routes", () => {
	let app: Application;
	let server: Server;

	beforeAll(async () => {
		app = createTestApp();
		return new Promise<void>((resolve) => {
			server = app.listen(0, () => {
				resolve();
			});
		});
	});

	afterAll(async () => {
		return new Promise<void>((resolve) => {
			server.close(() => {
				resolve();
			});
		});
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

	it("should redirect unauthenticated users from apply page to login", async () => {
		const response = await request(app).get("/job-role-list/1/apply");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/login");
	});

	it("should redirect unauthenticated users when posting an application", async () => {
		const response = await request(app)
			.post("/job-role-list/1/apply")
			.field("cvText", "my cv");

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
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).jwtToken = "admin-token";
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).userRole = "ADMIN";
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
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).jwtToken = "user-token";
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).userRole = "USER";
			next();
		}) as RequestHandler);

		userApp.use(router);

		const response = await request(userApp).get("/job-role-create");

		expect(response.status).toBe(403);
		expect(response.text).toContain("Access restricted");
		expect(response.text).toContain(
			"You do not have permission to access this page.",
		);
	});

	it("should return 200 for login page", async () => {
		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Sign in");
	});

	it("should return 200 for register confirmation page", async () => {
		const response = await request(app).get("/register/confirmation");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Registration successful");
	});

	it("should redirect authenticated users from login page to home", async () => {
		const authApp = express();

		nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
			autoescape: true,
			express: authApp,
			noCache: true,
		});

		authApp.use(
			session({
				secret: "test-session-secret",
				resave: false,
				saveUninitialized: false,
			}),
		);

		authApp.use(((req, _res, next) => {
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).jwtToken = "existing-token";
			next();
		}) as RequestHandler);

		authApp.use(authRouter);
		authApp.use(router);

		const response = await request(authApp).get("/login");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/");
	});

	it("should redirect authenticated users from register page to home", async () => {
		const authApp = express();

		nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
			autoescape: true,
			express: authApp,
			noCache: true,
		});

		authApp.use(
			session({
				secret: "test-session-secret",
				resave: false,
				saveUninitialized: false,
			}),
		);

		authApp.use(((req, _res, next) => {
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).jwtToken = "existing-token";
			next();
		}) as RequestHandler);

		authApp.use(authRouter);
		authApp.use(router);

		const response = await request(authApp).get("/register");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/");
	});

	it("should redirect authenticated users from register confirmation to home", async () => {
		const authApp = express();

		nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
			autoescape: true,
			express: authApp,
			noCache: true,
		});

		authApp.use(
			session({
				secret: "test-session-secret",
				resave: false,
				saveUninitialized: false,
			}),
		);

		authApp.use(((req, _res, next) => {
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).jwtToken = "existing-token";
			next();
		}) as RequestHandler);

		authApp.use(authRouter);
		authApp.use(router);

		const response = await request(authApp).get("/register/confirmation");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/");
	});

	it("should clear session and redirect to login on logout", async () => {
		const authApp = express();

		nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
			autoescape: true,
			express: authApp,
			noCache: true,
		});

		authApp.use(
			session({
				secret: "test-session-secret",
				resave: false,
				saveUninitialized: false,
			}),
		);

		authApp.use(((req, _res, next) => {
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).jwtToken = "existing-token";
			(
				req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
			).userRole = "ADMIN";
			next();
		}) as RequestHandler);

		authApp.use(authRouter);
		authApp.use(router);

		const response = await request(authApp).get("/logout");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/logout/confirmation");
	});
});
