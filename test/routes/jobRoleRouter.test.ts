import path from "node:path";
import type { Application, RequestHandler } from "express";
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
import apiClient from "../../src/config/apiClient";
import { JobRoleController } from "../../src/controllers/jobRoleController";
import authRouter from "../../src/routes/authRouter";
import router from "../../src/routes/jobRoleRouter";
import { AdminApplicationService } from "../../src/services/adminApplicationService";
import { UserApplicationService } from "../../src/services/userApplicationService";

vi.mock("../../src/config/apiClient", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

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
	testApp.get("/test-session-redirect", (req, res) => {
		res.json({ redirectAfterLogin: req.session.redirectAfterLogin });
	});

	testApp.use(authRouter);
	testApp.use(router);
	testApp.use((_req, res) => {
		res.status(404).render("pages/404.njk");
	});

	return testApp;
}

function createAdminApp(role: "ADMIN" | "USER" = "ADMIN"): Application {
	const adminApp = express();
	adminApp.use(express.urlencoded({ extended: true }));
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

	adminApp.use(((req, res, next) => {
		(
			req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
		).jwtToken = "admin-token";
		(
			req.session as { jwtToken?: string; userRole?: "ADMIN" | "USER" }
		).userRole = role;
		res.locals.currentUserRole = role;
		next();
	}) as RequestHandler);

	adminApp.use(router);
	return adminApp;
}

describe("routes", () => {
	let app: Application;
	let server: ReturnType<Application["listen"]>;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(apiClient.get).mockImplementation(async (url) => {
			if (url === "/api/job-roles") {
				return {
					data: [
						{
							jobRoleId: 1,
							roleName: "Software Engineer",
							locationName: "Birmingham",
							capabilityName: "Software Engineering",
							bandName: "Engineer",
							closingDate: "2026-08-06T00:00:00.000Z",
							status: "OPEN",
						},
					],
				};
			}

			if (url === "/api/job-roles/1") {
				return {
					data: {
						jobRoleId: 1,
						roleName: "Software Engineer",
						locationName: "Birmingham",
						capabilityName: "Software Engineering",
						bandName: "Engineer",
						closingDate: "2026-08-06T00:00:00.000Z",
						statusName: "OPEN",
						numberOfOpenPositions: 1,
					},
				};
			}

			if (url === "/api/job-roles/locations") {
				return { data: [{ locationId: 1, locationName: "Birmingham" }] };
			}

			if (url === "/api/job-roles/capabilities") {
				return {
					data: [{ capabilityId: 1, capabilityName: "Software Engineering" }],
				};
			}

			if (url === "/api/job-roles/bands") {
				return { data: [{ bandId: 1, bandName: "Engineer" }] };
			}

			throw new Error(`Unexpected URL: ${String(url)}`);
		});
	});

	it("calls the backend teapot endpoint before rendering the teapot page", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({ status: 418 });

		const response = await request(app).get("/teapot");

		expect(response.status).toBe(200);
		expect(apiClient.get).toHaveBeenCalledWith("/teapot", {
			validateStatus: expect.any(Function),
		});
		expect(response.text).toContain("I'm a Teapot");
	});

	it("shows frontend and backend feature image markers", async () => {
		vi.mocked(apiClient.get).mockResolvedValue({
			data: {
				service: "team3-backend",
				marker: "chore-test-branch-one-backend",
				message: "Selected backend feature image is running",
			},
		});

		const response = await request(app).get("/deployment-check");

		expect(response.status).toBe(200);
		expect(apiClient.get).toHaveBeenCalledWith("/api/deployment-check");
		expect(response.text).toContain("chore-test-branch-one-frontend");
		expect(response.text).toContain("chore-test-branch-one-backend");
	});

	it("shows a clear failure when the backend feature API is unavailable", async () => {
		vi.mocked(apiClient.get).mockRejectedValue(new Error("Unavailable"));

		const response = await request(app).get("/deployment-check");

		expect(response.status).toBe(502);
		expect(response.text).toContain("Backend feature API unavailable");
	});

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

	it("should return 404 page for unknown routes", async () => {
		const response = await request(app).get("/not-a-real-route");

		expect(response.status).toBe(404);
		expect(response.text).toContain("Page Not Found");
	});

	it("should allow unauthenticated users to access job role list", async () => {
		const response = await request(app).get("/job-role-list");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Open job roles");
	});

	it("should redirect unauthenticated users from create page to 401 flow", async () => {
		const response = await request(app).get("/job-role-create");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/unauthorised");
	});

	it("should allow unauthenticated users to access job role detail page", async () => {
		const response = await request(app).get("/job-role-list/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
	});

	it("should redirect unauthenticated users from apply page to 401 flow", async () => {
		const agent = request.agent(app);
		const response = await agent.get("/job-role-list/1/apply");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/unauthorised");

		const sessionResponse = await agent.get("/test-session-redirect");
		expect(sessionResponse.body.redirectAfterLogin).toBe(
			"/job-role-list/1/apply",
		);
	});

	it("should redirect unauthenticated users when posting an application", async () => {
		const response = await request(app)
			.post("/job-role-list/1/apply")
			.field("cvText", "my cv");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/unauthorised");
	});

	it("should redirect unauthenticated users from application confirmation page to 401 flow", async () => {
		const response = await request(app).get(
			"/job-role-list/1/apply/confirmation",
		);

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/unauthorised");
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
		vi.mocked(apiClient.get)
			.mockResolvedValueOnce({ data: [{ statusId: 1, statusName: "OPEN" }] })
			.mockResolvedValueOnce({
				data: [{ locationId: 2, locationName: "Birmingham" }],
			})
			.mockResolvedValueOnce({
				data: [{ capabilityId: 3, capabilityName: "Engineering" }],
			})
			.mockResolvedValueOnce({ data: [{ bandId: 4, bandName: "Engineer" }] });

		const response = await request(adminApp).get("/job-role-create");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Create job role");
		expect(response.text).toContain('name="capabilityId"');
		expect(response.text).toContain('name="bandId"');
		expect(response.text).toContain('name="locationId"');
		expect(response.text).toContain('value="OPEN"');
	});

	it("should create a job role and redirect ADMIN to the job role list", async () => {
		const adminApp = createAdminApp();
		vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

		const response = await request(adminApp).post("/job-role-create").send({
			roleName: "Software Engineer",
			description: "Build software products",
			responsibilities: "Collaborate with the delivery team",
			sharepointUrl: "https://example.com/spec",
			numberOfOpenPositions: "2",
			closingDate: "2026-12-31",
			capabilityId: "1",
			bandId: "2",
			locationId: "3",
		});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-role-list");
		expect(apiClient.post).toHaveBeenCalledWith(
			"/api/job-roles",
			expect.objectContaining({
				roleName: "Software Engineer",
				numberOfOpenPositions: 2,
				capabilityId: 1,
				bandId: 2,
				locationId: 3,
			}),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer admin-token",
				}),
			}),
		);
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

	it("should redirect unauthenticated users from the edit page", async () => {
		const response = await request(app).get("/job-role-edit/1");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/unauthorised");
	});

	it("should render a pre-populated edit form for an admin", async () => {
		const adminApp = createAdminApp();
		vi.mocked(apiClient.get).mockImplementation(async (url) => {
			const responses: Record<string, unknown> = {
				"/api/job-roles/1": {
					jobRoleId: 1,
					roleName: "Software Engineer",
					description: "Build software",
					responsibilities: "Deliver features",
					sharepointUrl: "https://example.com/spec",
					numberOfOpenPositions: 2,
					closingDate: "2099-12-31T00:00:00.000Z",
					capabilityName: "Engineering",
					bandName: "Engineer",
					locationName: "Birmingham",
					statusName: "OPEN",
				},
				"/api/job-roles/statuses": [{ statusId: 1, statusName: "OPEN" }],
				"/api/job-roles/locations": [
					{ locationId: 2, locationName: "Birmingham" },
				],
				"/api/job-roles/capabilities": [
					{ capabilityId: 3, capabilityName: "Engineering" },
				],
				"/api/job-roles/bands": [{ bandId: 4, bandName: "Engineer" }],
			};
			return { data: responses[String(url)] };
		});

		const response = await request(adminApp).get("/job-role-edit/1");

		expect(response.status).toBe(200);
		expect(response.text).toContain('value="Software Engineer"');
		expect(response.text).toContain('value="3" selected');
		expect(response.text).toContain('value="4" selected');
		expect(response.text).toContain('value="2" selected');
	});

	it("should update a job role and redirect an admin to its detail page", async () => {
		const adminApp = createAdminApp();
		vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: {} });

		const response = await request(adminApp).post("/job-role-edit").send({
			jobRoleId: "1",
			roleName: "Lead Engineer",
			description: "Lead delivery",
			responsibilities: "Coach engineers",
			sharepointUrl: "https://example.com/lead-role",
			numberOfOpenPositions: "3",
			capabilityId: "1",
			bandId: "2",
			locationId: "3",
		});

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-role-list/1");
		expect(apiClient.patch).toHaveBeenCalledWith(
			"/api/job-roles/1",
			expect.objectContaining({
				roleName: "Lead Engineer",
				numberOfOpenPositions: 3,
			}),
			expect.objectContaining({
				headers: expect.objectContaining({
					Authorization: "Bearer admin-token",
				}),
			}),
		);
	});

	it("should show delete controls only on the admin role detail page", async () => {
		const adminApp = createAdminApp();

		const [listResponse, detailResponse] = await Promise.all([
			request(adminApp).get("/job-role-list"),
			request(adminApp).get("/job-role-list/1"),
		]);

		expect(listResponse.status).toBe(200);
		expect(listResponse.text).not.toContain("delete-role-trigger");
		expect(listResponse.text).not.toContain('id="delete-role-modal-backdrop"');
		expect(detailResponse.status).toBe(200);
		expect(detailResponse.text).toContain("Delete role");
		expect(detailResponse.text).toContain('id="delete-role-form"');
	});

	it("should delete a job role and redirect an admin to the job role list", async () => {
		const adminApp = createAdminApp();
		vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

		const response = await request(adminApp).post("/job-role-list/1/delete");

		expect(response.status).toBe(303);
		expect(response.headers.location).toBe("/job-role-list");
		expect(apiClient.delete).toHaveBeenCalledWith("/api/job-roles/1", {
			headers: { Authorization: "Bearer admin-token" },
		});
	});

	it("should render cv page for an existing application", async () => {
		const adminApp = createAdminApp();

		vi.spyOn(AdminApplicationService.prototype, "getAll").mockResolvedValueOnce(
			[
				{
					applicationId: 10,
					applicantEmail: "a@example.com",
					roleName: "Engineer",
					applicationDate: "2026-08-01",
					status: "pending",
					cvText: "Cached text",
				},
			],
		);
		vi.spyOn(
			AdminApplicationService.prototype,
			"getCvTextById",
		).mockResolvedValueOnce("Full CV text");

		const response = await request(adminApp).get("/job-applications/10/cv");

		expect(response.status).toBe(200);
		expect(response.text).toContain("a@example.com");
		expect(response.text).toContain("Full CV text");
	});

	it("should return 400 when cv page id is invalid", async () => {
		const adminApp = createAdminApp();

		const response = await request(adminApp).get(
			"/job-applications/not-a-number/cv",
		);

		expect(response.status).toBe(400);
	});

	it("should return 404 when cv page application is not found", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(AdminApplicationService.prototype, "getAll").mockResolvedValueOnce(
			[],
		);

		const response = await request(adminApp).get("/job-applications/999/cv");

		expect(response.status).toBe(404);
	});

	it("should return 500 when cv page loading fails", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(AdminApplicationService.prototype, "getAll").mockRejectedValueOnce(
			new Error("boom"),
		);

		const response = await request(adminApp).get("/job-applications/10/cv");

		expect(response.status).toBe(500);
	});

	it("should return cv text payload from api route", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(
			AdminApplicationService.prototype,
			"getCvTextById",
		).mockResolvedValueOnce("Server CV");

		const response = await request(adminApp).get(
			"/api/job-applications/12/cv-text",
		);

		expect(response.status).toBe(200);
		expect(response.body.cvText).toBe("Server CV");
	});

	it("should return 400 for invalid cv-text api id", async () => {
		const adminApp = createAdminApp();

		const response = await request(adminApp).get(
			"/api/job-applications/not-a-number/cv-text",
		);

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid application ID");
	});

	it("should return axios error response from cv-text route", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(
			AdminApplicationService.prototype,
			"getCvTextById",
		).mockRejectedValueOnce({
			isAxiosError: true,
			message: "axios fail",
			response: { status: 409, data: { message: "Conflict" } },
		});

		const response = await request(adminApp).get(
			"/api/job-applications/12/cv-text",
		);

		expect(response.status).toBe(409);
		expect(response.body.message).toBe("Conflict");
	});

	it("should return generic error from cv-text route", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(
			AdminApplicationService.prototype,
			"getCvTextById",
		).mockRejectedValueOnce(new Error("bad"));

		const response = await request(adminApp).get(
			"/api/job-applications/12/cv-text",
		);

		expect(response.status).toBe(500);
		expect(response.body.message).toBe("bad");
	});

	it("should route job-applications admin to controller", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(
			JobRoleController.prototype,
			"getApplications",
		).mockImplementationOnce(async (_req, res) => {
			res.status(200).send("ok");
		});

		const response = await request(adminApp).get("/job-applications/admin");

		expect(response.status).toBe(200);
		expect(response.text).toContain("ok");
	});

	it("should render applications belonging to the logged-in user", async () => {
		const userApp = createAdminApp("USER");
		vi.spyOn(UserApplicationService.prototype, "getAll").mockResolvedValueOnce([
			{
				applicationId: 1,
				jobRoleId: 2,
				roleName: "Software Engineer",
				applicationDate: "2026-09-02",
				status: "pending",
				cvText: "Experienced software engineer",
			},
		]);

		const response = await request(userApp).get("/job-applications");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Software Engineer");
		expect(response.text).toContain("Pending");
		expect(response.text).toContain('href="/job-applications/1/cv"');
		expect(response.text).toContain('action="/job-applications/1/withdraw"');
		expect(response.text).not.toContain("Experienced software engineer");
		expect(response.text).toContain('id="withdraw-popup"');
		expect(response.text).toContain("Confirm withdrawal");
		expect(response.text).not.toContain("onsubmit=");
		expect(UserApplicationService.prototype.getAll).toHaveBeenCalledWith(
			"admin-token",
		);
	});

	it("should render the logged-in user's CV page", async () => {
		const userApp = createAdminApp("USER");
		vi.spyOn(UserApplicationService.prototype, "getAll").mockResolvedValueOnce([
			{
				applicationId: 1,
				jobRoleId: 2,
				roleName: "Software Engineer",
				applicationDate: "2026-09-02",
				status: "pending",
				cvText: "Experienced software engineer",
			},
		]);

		const response = await request(userApp).get("/job-applications/1/cv");

		expect(response.status).toBe(200);
		expect(response.text).toContain("Your CV");
		expect(response.text).toContain("Experienced software engineer");
		expect(response.text).toContain('href="/job-applications"');
	});

	it("should withdraw a pending user application and redirect", async () => {
		const userApp = createAdminApp("USER");
		vi.spyOn(
			UserApplicationService.prototype,
			"withdraw",
		).mockResolvedValueOnce();

		const response = await request(userApp).post(
			"/job-applications/1/withdraw",
		);

		expect(response.status).toBe(303);
		expect(response.headers.location).toBe("/job-applications");
		expect(UserApplicationService.prototype.withdraw).toHaveBeenCalledWith(
			1,
			"admin-token",
		);
	});

	it("should reject admin withdrawal requests", async () => {
		const adminApp = createAdminApp();

		const response = await request(adminApp).post(
			"/job-applications/1/withdraw",
		);

		expect(response.status).toBe(403);
	});

	it("should render an error when user applications cannot be loaded", async () => {
		const userApp = createAdminApp("USER");
		vi.spyOn(UserApplicationService.prototype, "getAll").mockRejectedValueOnce(
			new Error("Applications unavailable"),
		);

		const response = await request(userApp).get("/job-applications");

		expect(response.status).toBe(500);
		expect(response.text).toContain(
			"We could not load your applications. Please try again later.",
		);
		expect(response.text).not.toContain("Applications unavailable");
	});

	it("should redirect admins to the admin applications page", async () => {
		const adminApp = createAdminApp();

		const response = await request(adminApp).get("/job-applications");

		expect(response.status).toBe(302);
		expect(response.headers.location).toBe("/job-applications/admin");
	});

	it("should return applications list for admin api route", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(AdminApplicationService.prototype, "getAll").mockResolvedValueOnce(
			[
				{
					applicationId: 1,
					applicantEmail: "a@example.com",
					roleName: "Engineer",
					applicationDate: "2026-08-01",
					status: "pending",
				},
			],
		);

		const response = await request(adminApp).get("/api/job-applications/admin");

		expect(response.status).toBe(200);
		expect(Array.isArray(response.body)).toBe(true);
	});

	it("should update an application from an HTML form and redirect", async () => {
		const adminApp = createAdminApp();
		const approve = vi
			.spyOn(AdminApplicationService.prototype, "approve")
			.mockResolvedValueOnce();

		const response = await request(adminApp)
			.post("/job-applications/22/status")
			.type("form")
			.send({ action: "approve" });

		expect(response.status).toBe(303);
		expect(response.headers.location).toBe("/job-applications/admin");
		expect(approve).toHaveBeenCalledWith(22, "admin-token");
	});

	it("should return 500 for admin api list failures", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(AdminApplicationService.prototype, "getAll").mockRejectedValueOnce(
			new Error("list failed"),
		);

		const response = await request(adminApp).get("/api/job-applications/admin");

		expect(response.status).toBe(500);
		expect(response.body.message).toBe("list failed");
	});

	it("should return 400 for invalid status id", async () => {
		const adminApp = createAdminApp();

		const response = await request(adminApp)
			.post("/api/job-applications/not-a-number/status")
			.send({ action: "approve" });

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid application ID");
	});

	it("should approve application successfully", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(
			AdminApplicationService.prototype,
			"approve",
		).mockResolvedValueOnce();

		const response = await request(adminApp)
			.post("/api/job-applications/22/status")
			.send({ action: "approve" });

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
	});

	it("should return axios error from approve route", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(
			AdminApplicationService.prototype,
			"approve",
		).mockRejectedValueOnce({
			isAxiosError: true,
			message: "approve fail",
			response: { status: 409, data: { message: "Already approved" } },
		});

		const response = await request(adminApp)
			.post("/api/job-applications/22/status")
			.send({ action: "approve" });

		expect(response.status).toBe(409);
		expect(response.body.message).toBe("Already approved");
	});

	it("should return generic error from approve route", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(
			AdminApplicationService.prototype,
			"approve",
		).mockRejectedValueOnce(new Error("approve error"));

		const response = await request(adminApp)
			.post("/api/job-applications/22/status")
			.send({ action: "approve" });

		expect(response.status).toBe(500);
		expect(response.body.message).toBe("approve error");
	});

	it("should return 400 for invalid reject id", async () => {
		const adminApp = createAdminApp();

		const response = await request(adminApp)
			.post("/api/job-applications/not-a-number/status")
			.send({ action: "reject" });

		expect(response.status).toBe(400);
		expect(response.body.message).toBe("Invalid application ID");
	});

	it("should reject application successfully", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(
			AdminApplicationService.prototype,
			"reject",
		).mockResolvedValueOnce();

		const response = await request(adminApp)
			.post("/api/job-applications/22/status")
			.send({ action: "reject" });

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
	});

	it("should return axios error from reject route", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(AdminApplicationService.prototype, "reject").mockRejectedValueOnce(
			{
				isAxiosError: true,
				message: "reject fail",
				response: { status: 409, data: { message: "Already rejected" } },
			},
		);

		const response = await request(adminApp)
			.post("/api/job-applications/22/status")
			.send({ action: "reject" });

		expect(response.status).toBe(409);
		expect(response.body.message).toBe("Already rejected");
	});

	it("should return generic error from reject route", async () => {
		const adminApp = createAdminApp();
		vi.spyOn(AdminApplicationService.prototype, "reject").mockRejectedValueOnce(
			new Error("reject error"),
		);

		const response = await request(adminApp)
			.post("/api/job-applications/22/status")
			.send({ action: "reject" });

		expect(response.status).toBe(500);
		expect(response.body.message).toBe("reject error");
	});

	it("should return 400 for invalid status action", async () => {
		const adminApp = createAdminApp();

		const response = await request(adminApp)
			.post("/api/job-applications/22/status")
			.send({ action: "hold" });

		expect(response.status).toBe(400);
		expect(response.body.message).toBe(
			"Invalid action. Use 'approve' or 'reject'.",
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
