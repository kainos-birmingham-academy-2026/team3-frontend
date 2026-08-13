import type { Server } from "node:http";
import path from "node:path";
import type { Application } from "express";
import express from "express";
import session from "express-session";
import nunjucks from "nunjucks";
import request from "supertest";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { AuthController } from "../../src/controllers/authController";
import authRouter from "../../src/routes/authRouter";

function createTestApp(): Application {
	const testApp = express();

	nunjucks.configure(path.resolve(process.cwd(), "src/views"), {
		autoescape: true,
		express: testApp,
		noCache: true,
	});

	testApp.use(express.urlencoded({ extended: true }));
	testApp.use(express.json());
	testApp.use(
		session({
			secret: "test-session-secret",
			resave: false,
			saveUninitialized: false,
		}),
	);
	testApp.use(authRouter);

	return testApp;
}

describe("authRouter", () => {
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

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("should call showLogin for GET /login", async () => {
		const showLogin = vi
			.spyOn(AuthController.prototype, "showLogin")
			.mockImplementation((_req, res) => {
				res.status(200).send("login page");
			});

		const response = await request(app).get("/login");

		expect(response.status).toBe(200);
		expect(showLogin).toHaveBeenCalledTimes(1);
	});

	it("should call login for POST /login", async () => {
		const login = vi
			.spyOn(AuthController.prototype, "login")
			.mockImplementation(async (_req, res) => {
				res.status(200).send("logged in");
			});

		const response = await request(app).post("/login").send({
			email: "test@example.com",
			password: "Password123!",
		});

		expect(response.status).toBe(200);
		expect(login).toHaveBeenCalledTimes(1);
	});

	it("should call showRegister for GET /register", async () => {
		const showRegister = vi
			.spyOn(AuthController.prototype, "showRegister")
			.mockImplementation((_req, res) => {
				res.status(200).send("register page");
			});

		const response = await request(app).get("/register");

		expect(response.status).toBe(200);
		expect(showRegister).toHaveBeenCalledTimes(1);
	});

	it("should call showRegisterConfirmation for GET /register/confirmation", async () => {
		const showRegisterConfirmation = vi
			.spyOn(AuthController.prototype, "showRegisterConfirmation")
			.mockImplementation((_req, res) => {
				res.status(200).send("register confirmation");
			});

		const response = await request(app).get("/register/confirmation");

		expect(response.status).toBe(200);
		expect(showRegisterConfirmation).toHaveBeenCalledTimes(1);
	});

	it("should call register for POST /register", async () => {
		const register = vi
			.spyOn(AuthController.prototype, "register")
			.mockImplementation(async (_req, res) => {
				res.status(200).send("registered");
			});

		const response = await request(app).post("/register").send({
			email: "new@example.com",
			password: "Password123!",
			confirmPassword: "Password123!",
		});

		expect(response.status).toBe(200);
		expect(register).toHaveBeenCalledTimes(1);
	});

	it("should return 401 for GET /unauthorised", async () => {
		const response = await request(app).get("/unauthorised");

		expect(response.status).toBe(401);
		expect(response.text).toContain("Sign in required");
	});

	it("should call showLogoutConfirmation for GET /logout/confirmation", async () => {
		const showLogoutConfirmation = vi
			.spyOn(AuthController.prototype, "showLogoutConfirmation")
			.mockImplementation((_req, res) => {
				res.status(200).send("logout confirmation");
			});

		const response = await request(app).get("/logout/confirmation");

		expect(response.status).toBe(200);
		expect(showLogoutConfirmation).toHaveBeenCalledTimes(1);
	});

	it("should call logout for GET /logout", async () => {
		const logout = vi
			.spyOn(AuthController.prototype, "logout")
			.mockImplementation((_req, res) => {
				res.status(200).send("logged out");
			});

		const response = await request(app).get("/logout");

		expect(response.status).toBe(200);
		expect(logout).toHaveBeenCalledTimes(1);
	});
});
