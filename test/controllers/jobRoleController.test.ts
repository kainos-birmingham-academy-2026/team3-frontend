import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";
import type { AdminApplicationService } from "../../src/services/adminApplicationService";
import type { JobRoleService } from "../../src/services/jobRoleService";

type TestRequest = {
	session: {
		jwtToken?: string;
		userRole?: "ADMIN" | "USER";
		dropdownOptions?: {
			statuses: unknown[];
			locations: unknown[];
			capabilities: unknown[];
			bands: unknown[];
		};
	};
	params?: {
		id?: string | string[];
	};
	body?: Record<string, unknown>;
	query?: Record<string, string | string[]>;
};

function createRequest(partial: Partial<TestRequest> = {}): TestRequest {
	return {
		session: {
			jwtToken: undefined,
		},
		body: {},
		query: {},
		...partial,
	};
}

function createResponse(): Response {
	const res = {
		redirect: vi.fn(),
		render: vi.fn(),
		status: vi.fn(),
	} as unknown as Response;

	vi.mocked(res.status).mockReturnValue(res);
	return res;
}

describe("JobRoleController", () => {
	const jobRoleService = {
		getAll: vi.fn(),
		getById: vi.fn(),
		applyForRole: vi.fn(),
		createJobRole: vi.fn(),
		updateJobRole: vi.fn(),
		deleteJobRole: vi.fn(),
		getAllStatuses: vi.fn(),
		getAllLocations: vi.fn(),
		getAllCapabilities: vi.fn(),
		getAllBands: vi.fn(),
	};
	const adminApplicationService = {
		getAll: vi.fn(),
	};

	const controller = new JobRoleController(
		jobRoleService as unknown as JobRoleService,
		adminApplicationService as unknown as AdminApplicationService,
	);

	beforeEach(() => {
		vi.clearAllMocks();
		jobRoleService.getAllStatuses.mockResolvedValue([]);
		jobRoleService.getAllLocations.mockResolvedValue([]);
		jobRoleService.getAllCapabilities.mockResolvedValue([]);
		jobRoleService.getAllBands.mockResolvedValue([]);
		adminApplicationService.getAll.mockResolvedValue([]);
	});

	it("should call service with JWT token and render job roles", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
		});
		const res = createResponse();
		const jobRoles = [
			{
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Birmingham",
				capabilityId: 1,
				bandId: 5,
				closingDate: "2026-08-06",
				status: "open",
			},
		];

		jobRoleService.getAll.mockResolvedValueOnce(jobRoles);

		await controller.getAll(req as unknown as Request, res);

		expect(jobRoleService.getAll).toHaveBeenCalledWith("jwt-token", {
			roleName: undefined,
			locationId: undefined,
			capabilityId: undefined,
			bandId: undefined,
			closingFrom: undefined,
			closingBy: undefined,
		});
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
			jobRoles,
			filters: expect.any(Object),
			locationOptions: [],
			capabilityOptions: [],
			bandOptions: [],
			selectedLocationIds: {},
			selectedCapabilityIds: {},
			selectedBandIds: {},
		});
	});

	it("should allow missing session token and still render public job roles", async () => {
		const req = createRequest();
		const res = createResponse();
		const jobRoles = [
			{
				jobRoleId: 2,
				roleName: "Delivery Manager",
				location: "Leeds",
				capabilityId: 2,
				bandId: 6,
				closingDate: "2026-09-01",
				status: "open",
			},
		];

		jobRoleService.getAll.mockResolvedValueOnce(jobRoles);

		await controller.getAll(req as unknown as Request, res);

		expect(jobRoleService.getAll).toHaveBeenCalledWith(
			undefined,
			expect.any(Object),
		);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
			jobRoles,
			filters: expect.any(Object),
			locationOptions: [],
			capabilityOptions: [],
			bandOptions: [],
			selectedLocationIds: {},
			selectedCapabilityIds: {},
			selectedBandIds: {},
		});
	});

	it("should pass list filters to the API service and view", async () => {
		const req = createRequest({
			query: {
				roleName: " Engineer ",
				locationId: ["1", "2"],
				capabilityId: "3",
				bandId: "4",
				closingFrom: "2026-09-01",
				closingBy: "2026-12-31",
			},
		});
		const res = createResponse();
		jobRoleService.getAll.mockResolvedValueOnce([]);

		await controller.getAll(req as unknown as Request, res);

		const filters = {
			roleName: "Engineer",
			locationId: ["1", "2"],
			capabilityId: ["3"],
			bandId: ["4"],
			closingFrom: "2026-09-01",
			closingBy: "2026-12-31",
		};
		expect(jobRoleService.getAll).toHaveBeenCalledWith(undefined, filters);
		expect(res.render).toHaveBeenCalledWith(
			"pages/jobRoleList.njk",
			expect.objectContaining({ filters }),
		);
	});

	it("should clear token and redirect to login when backend returns 401", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token", userRole: "USER" },
		});
		const res = createResponse();

		jobRoleService.getAll.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.getAll(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(req.session.userRole).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
		expect(res.render).not.toHaveBeenCalled();
	});

	it("should render 500 with empty list and message when API call fails", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
		});
		const res = createResponse();

		jobRoleService.getAll.mockRejectedValueOnce(
			new Error("Backend server error"),
		);

		await controller.getAll(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
			jobRoles: [],
			errorMessage: "Backend server error",
		});
	});

	it("should render detail page for getById success", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "7" },
		});
		const res = createResponse();
		const jobRole = {
			jobRoleId: 7,
			roleName: "QA Engineer",
		};

		jobRoleService.getById.mockResolvedValueOnce(jobRole);

		await controller.getById(req as unknown as Request, res);

		expect(jobRoleService.getById).toHaveBeenCalledWith("7", "jwt-token");
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleDetail.njk", {
			jobRoleId: jobRole,
		});
	});

	it("should use the first id when params.id is an array", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: ["12", "13"] },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 12,
			roleName: "Analyst",
		});

		await controller.getById(req as unknown as Request, res);

		expect(jobRoleService.getById).toHaveBeenCalledWith("12", "jwt-token");
	});

	it("should clear token and redirect to login when getById returns 401", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "1" },
		});
		const res = createResponse();

		jobRoleService.getById.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.getById(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
		expect(res.render).not.toHaveBeenCalled();
	});

	it("should render default message when non-Error is thrown", async () => {
		const req = createRequest({
			params: { id: "1" },
		});
		const res = createResponse();

		jobRoleService.getById.mockRejectedValueOnce("unknown failure");

		await controller.getById(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
			jobRoles: [],
			errorMessage: "Unable to load job roles",
		});
	});

	it("should load dropdown options and render the create form", async () => {
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
		});
		const res = createResponse();
		const statuses = [{ statusId: 1, statusName: "OPEN" }];
		const locations = [{ locationId: 2, locationName: "Birmingham" }];
		const capabilities = [{ capabilityId: 3, capabilityName: "Engineering" }];
		const bands = [{ bandId: 4, bandName: "Engineer" }];

		jobRoleService.getAllStatuses.mockResolvedValueOnce(statuses);
		jobRoleService.getAllLocations.mockResolvedValueOnce(locations);
		jobRoleService.getAllCapabilities.mockResolvedValueOnce(capabilities);
		jobRoleService.getAllBands.mockResolvedValueOnce(bands);

		await controller.showCreateForm(req as unknown as Request, res);

		expect(res.render).toHaveBeenCalledWith("pages/jobRoleCreate.njk", {
			canCreate: true,
			capabilityOptions: capabilities,
			bandOptions: bands,
			locationOptions: locations,
			statusOptions: statuses,
		});
		expect(req.session.dropdownOptions).toEqual({
			statuses,
			locations,
			capabilities,
			bands,
		});
	});

	it("should create a job role and redirect to the job role list", async () => {
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
			body: { roleName: "Software Engineer", numberOfOpenPositions: "2" },
		});
		const res = createResponse();

		jobRoleService.createJobRole.mockResolvedValueOnce(undefined);

		await controller.createJobRole(req as unknown as Request, res);

		expect(jobRoleService.createJobRole).toHaveBeenCalledWith(
			{ roleName: "Software Engineer", numberOfOpenPositions: "2" },
			"admin-token",
		);
		expect(res.redirect).toHaveBeenCalledWith("/job-role-list");
	});

	it("should render backend validation errors when creating a job role fails", async () => {
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
		});
		const res = createResponse();

		jobRoleService.createJobRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: {
				status: 400,
				data: {
					errors: [{ field: "roleName", message: "Role name is required" }],
				},
			},
		});

		await controller.createJobRole(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleCreate.njk", {
			canCreate: true,
			errorMessage: [{ field: "roleName", message: "Role name is required" }],
			capabilityOptions: [],
			bandOptions: [],
			locationOptions: [],
			statusOptions: [],
		});
	});

	it.each([
		["backend error", { error: "Closing date is invalid" }, "closingDate"],
		["backend message", { message: "Role data is incomplete" }, undefined],
		["generic validation", {}, undefined],
	])(
		"should render the appropriate 400 message for %s",
		async (_label, responseData, expectedField) => {
			const req = createRequest({
				session: { jwtToken: "admin-token", userRole: "ADMIN" },
			});
			const res = createResponse();

			jobRoleService.createJobRole.mockRejectedValueOnce({
				isAxiosError: true,
				response: { status: 400, data: responseData },
			});

			await controller.createJobRole(req as unknown as Request, res);

			const renderedError = vi.mocked(res.render).mock
				.calls[0]?.[1] as unknown as {
				errorMessage: string | { field?: string; message: string }[];
			};
			expect(res.status).toHaveBeenCalledWith(400);
			if ("error" in responseData) {
				expect(renderedError.errorMessage).toEqual([
					{ field: expectedField, message: responseData.error },
				]);
			} else if ("message" in responseData) {
				expect(renderedError.errorMessage).toBe(responseData.message);
			} else {
				expect(renderedError.errorMessage).toBe(
					"Please provide valid job role data.",
				);
			}
		},
	);

	it.each([
		[403, "You do not have permission to create a job role.", false],
		[500, "The job role could not be created. Please try again.", true],
	])(
		"should render the appropriate response for backend status %s",
		async (statusCode, errorMessage, canCreate) => {
			const req = createRequest({
				session: {
					jwtToken: "admin-token",
					userRole: "ADMIN",
					dropdownOptions: {
						statuses: [{ statusId: 1 }],
						locations: [{ locationId: 2 }],
						capabilities: [{ capabilityId: 3 }],
						bands: [{ bandId: 4 }],
					},
				},
			});
			const res = createResponse();

			jobRoleService.createJobRole.mockRejectedValueOnce({
				isAxiosError: true,
				response: { status: statusCode, data: {} },
			});

			await controller.createJobRole(req as unknown as Request, res);

			expect(res.status).toHaveBeenCalledWith(statusCode);
			expect(res.render).toHaveBeenCalledWith(
				"pages/jobRoleCreate.njk",
				expect.objectContaining({
					canCreate,
					errorMessage,
					capabilityOptions: [{ capabilityId: 3 }],
					bandOptions: [{ bandId: 4 }],
				}),
			);
		},
	);

	it("should render the service error when createJobRole throws a regular Error", async () => {
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
		});
		const res = createResponse();

		jobRoleService.createJobRole.mockRejectedValueOnce(
			new Error("Not authenticated"),
		);

		await controller.createJobRole(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith(
			"pages/jobRoleCreate.njk",
			expect.objectContaining({
				canCreate: true,
				errorMessage: "Not authenticated",
			}),
		);
	});

	it("should render an error when loading create-form options fails", async () => {
		const req = createRequest({
			session: { jwtToken: "expired-token", userRole: "ADMIN" },
		});
		const res = createResponse();

		jobRoleService.getAllStatuses.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.showCreateForm(req as unknown as Request, res);

		expect(req.session.jwtToken).toBe("expired-token");
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
			jobRoles: [],
			errorMessage: "Failed to fetch dropdown options",
		});
	});

	it("should clear the session and redirect to login for an unauthorized create response", async () => {
		const req = createRequest({
			session: { jwtToken: "expired-token", userRole: "ADMIN" },
		});
		const res = createResponse();

		jobRoleService.createJobRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.createJobRole(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(req.session.userRole).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
		expect(res.render).not.toHaveBeenCalled();
	});

	it("should load the job role and options into the edit form", async () => {
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
			params: { id: "7" },
		});
		const res = createResponse();
		const jobRole = {
			jobRoleId: 7,
			roleName: "Lead Engineer",
			closingDate: "2000-01-01",
		};
		jobRoleService.getById.mockResolvedValueOnce(jobRole);
		jobRoleService.getAllStatuses.mockResolvedValueOnce([]);
		jobRoleService.getAllLocations.mockResolvedValueOnce([{ locationId: 1 }]);
		jobRoleService.getAllCapabilities.mockResolvedValueOnce([
			{ capabilityId: 2 },
		]);
		jobRoleService.getAllBands.mockResolvedValueOnce([{ bandId: 3 }]);

		await controller.showEditForm(req as unknown as Request, res);

		expect(jobRoleService.getById).toHaveBeenCalledWith("7", "admin-token");
		expect(res.render).toHaveBeenCalledWith(
			"pages/jobRoleEdit.njk",
			expect.objectContaining({
				jobRole,
				locationOptions: [{ locationId: 1 }],
				capabilityOptions: [{ capabilityId: 2 }],
				bandOptions: [{ bandId: 3 }],
				minClosingDate: "2000-01-01",
			}),
		);
	});

	it("should update a job role and redirect to its detail page", async () => {
		const body = { jobRoleId: "7", roleName: "Lead Engineer" };
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
			body,
		});
		const res = createResponse();

		await controller.updateJobRole(req as unknown as Request, res);

		expect(jobRoleService.updateJobRole).toHaveBeenCalledWith(
			body,
			"admin-token",
		);
		expect(res.redirect).toHaveBeenCalledWith("/job-role-list/7");
	});

	it("should delete a job role and redirect to the job role list", async () => {
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
			params: { id: "7" },
		});
		const res = createResponse();
		jobRoleService.deleteJobRole.mockResolvedValueOnce(undefined);

		await controller.deleteJobRole(req as unknown as Request, res);

		expect(jobRoleService.deleteJobRole).toHaveBeenCalledWith(
			"7",
			"admin-token",
		);
		expect(res.redirect).toHaveBeenCalledWith(303, "/job-role-list");
	});

	it.each([
		[403, "You do not have permission to delete this job role."],
		[404, "Job role not found."],
	])(
		"should render a %s API error when deleting a job role",
		async (statusCode, errorMessage) => {
			const req = createRequest({
				session: { jwtToken: "admin-token", userRole: "ADMIN" },
				params: { id: "7" },
			});
			const res = createResponse();
			jobRoleService.deleteJobRole.mockRejectedValueOnce({
				isAxiosError: true,
				response: { status: statusCode },
			});

			await controller.deleteJobRole(req as unknown as Request, res);

			expect(res.status).toHaveBeenCalledWith(statusCode);
			expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
				jobRoles: [],
				errorMessage,
			});
		},
	);

	it("should render a service error when deleting a job role", async () => {
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
			params: { id: "7" },
		});
		const res = createResponse();
		jobRoleService.deleteJobRole.mockRejectedValueOnce(
			new Error("Delete service unavailable"),
		);

		await controller.deleteJobRole(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
			jobRoles: [],
			errorMessage: "Delete service unavailable",
		});
	});

	it("should preserve submitted values and API validation errors", async () => {
		const body = {
			jobRoleId: "7",
			roleName: "",
			sharepointUrl: "https://example.com/spec",
			numberOfOpenPositions: "2",
			closingDate: "2000-01-01",
		};
		const req = createRequest({
			session: { jwtToken: "admin-token", userRole: "ADMIN" },
			body,
		});
		const res = createResponse();
		jobRoleService.updateJobRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: {
				status: 400,
				data: {
					errors: [{ field: "roleName", message: "Role name is required" }],
				},
			},
		});

		await controller.updateJobRole(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith(
			"pages/jobRoleEdit.njk",
			expect.objectContaining({
				jobRole: expect.objectContaining({
					jobRoleId: "7",
					roleName: "",
					jobSpecUrl: "https://example.com/spec",
					openPositions: "2",
				}),
				errorMessage: [{ field: "roleName", message: "Role name is required" }],
				minClosingDate: "2000-01-01",
			}),
		);
	});

	it("should render apply form when role is open with available positions", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "3" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 3,
			roleName: "Lead Software Engineer",
			status: "open",
			openPositions: 2,
		});

		await controller.showApplyForm(req as unknown as Request, res);

		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 3 }),
			canApply: true,
		});
	});

	it("should block apply form when role is closed or has no positions", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "3" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 3,
			roleName: "Lead Software Engineer",
			status: "open",
			openPositions: 0,
		});

		await controller.showApplyForm(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 3 }),
			canApply: false,
			errorMessage: "This role is not currently accepting applications.",
		});
	});

	it("should submit application with extracted cvText and redirect to confirmation", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "8" },
			body: {
				cvText: "Experienced engineer CV",
			},
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 8,
			roleName: "Delivery Manager",
			status: "open",
			openPositions: 1,
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(jobRoleService.applyForRole).toHaveBeenCalledWith(
			"8",
			"Experienced engineer CV",
			"jwt-token",
		);
		expect(res.redirect).toHaveBeenCalledWith(
			303,
			"/job-role-list/8/apply/confirmation",
		);
	});

	it("should render application received confirmation page", () => {
		const req = createRequest({
			params: { id: "8" },
		});
		const res = createResponse();

		controller.showApplicationConfirmation(req as unknown as Request, res);

		expect(res.render).toHaveBeenCalledWith(
			"pages/applicationReceivedConfirmation.njk",
			{
				jobRoleId: "8",
			},
		);
	});

	it("should show validation error when cv text is missing", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "9" },
			body: { cvText: "" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 9,
			roleName: "Platform Engineer",
			status: "open",
			openPositions: 1,
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(jobRoleService.applyForRole).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 9 }),
			canApply: true,
			errorMessage: "Please enter your CV text before submitting.",
		});
	});

	it("should block submitApplication when role is not accepting applications", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "10" },
			body: { cvText: "CV text here" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 10,
			roleName: "Senior Engineer",
			status: "closed",
			openPositions: 0,
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 10 }),
			canApply: false,
			errorMessage: "This role is not currently accepting applications.",
		});
	});

	it("should handle 404 error when submitting application", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "11" },
			body: { cvText: "CV text here" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 11,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		jobRoleService.applyForRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 11 }),
			canApply: true,
			errorMessage: "Job role not found.",
		});
	});

	it("should handle 409 error when submitting application (already applied)", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "12" },
			body: { cvText: "CV text here" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 12,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		jobRoleService.applyForRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 409 },
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 12 }),
			canApply: true,
			errorMessage: "You have already applied for this role.",
		});
	});

	it("should handle 400 error when submitting application (invalid CV file)", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "13" },
			body: { cvText: "CV text here" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 13,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		jobRoleService.applyForRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 400 },
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 13 }),
			canApply: true,
			errorMessage: "Please provide a valid CV file.",
		});
	});

	it("should handle 413 error when submitting application (CV too large)", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "14" },
			body: { cvText: "CV text here" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 14,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		jobRoleService.applyForRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 413 },
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(413);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 14 }),
			canApply: true,
			errorMessage: "The uploaded CV is too large.",
		});
	});

	it("should handle generic axios error when submitting application", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "15" },
			body: { cvText: "CV text here" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 15,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		jobRoleService.applyForRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: undefined,
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 15 }),
			canApply: true,
			errorMessage: "Unable to submit your application",
		});
	});

	it("should handle Error exception when submitting application", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "16" },
			body: { cvText: "CV text here" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 16,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		jobRoleService.applyForRole.mockRejectedValueOnce(
			new Error("Network error"),
		);

		await controller.submitApplication(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 16 }),
			canApply: true,
			errorMessage: "Network error",
		});
	});

	it("should clear token and redirect to login on 401 when showing apply form", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token", userRole: "USER" },
			params: { id: "17" },
		});
		const res = createResponse();

		jobRoleService.getById.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.showApplyForm(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(req.session.userRole).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
	});

	it("should handle Error exception when showing apply form", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "18" },
		});
		const res = createResponse();

		jobRoleService.getById.mockRejectedValueOnce(new Error("Server error"));

		await controller.showApplyForm(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			canApply: false,
			errorMessage: "Server error",
		});
	});

	it("should handle non-Error exception when showing apply form", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "19" },
		});
		const res = createResponse();

		jobRoleService.getById.mockRejectedValueOnce("Unknown error");

		await controller.showApplyForm(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			canApply: false,
			errorMessage: "This page cannot be loaded right now. Please try again.",
		});
	});

	it("should clear token and redirect to login on 401 when getById fails", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token", userRole: "USER" },
			params: { id: "20" },
		});
		const res = createResponse();

		jobRoleService.getById.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.getById(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(req.session.userRole).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
	});

	it("should handle Error exception when getById fails", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "21" },
		});
		const res = createResponse();

		jobRoleService.getById.mockRejectedValueOnce(new Error("Fetch failed"));

		await controller.getById(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
			jobRoles: [],
			errorMessage: "Fetch failed",
		});
	});

	it("should trim whitespace from cvText before validation", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "22" },
			body: { cvText: "   CV text with spaces   " },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 22,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(jobRoleService.applyForRole).toHaveBeenCalledWith(
			"22",
			"CV text with spaces",
			"jwt-token",
		);
	});

	it("should handle submitApplication with 401 error", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token", userRole: "USER" },
			params: { id: "23" },
			body: { cvText: "CV text" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 23,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		jobRoleService.applyForRole.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(req.session.userRole).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
	});

	it("should handle submitApplication when getById throws 401", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token", userRole: "USER" },
			params: { id: "24" },
			body: { cvText: "CV text" },
		});
		const res = createResponse();

		jobRoleService.getById.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.submitApplication(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(req.session.userRole).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
	});

	it("should handle submitApplication with non-Error exception", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token" },
			params: { id: "25" },
			body: { cvText: "CV text" },
		});
		const res = createResponse();

		jobRoleService.getById.mockResolvedValueOnce({
			jobRoleId: 25,
			roleName: "Engineer",
			status: "open",
			openPositions: 1,
		});

		jobRoleService.applyForRole.mockRejectedValueOnce("Unknown error");

		await controller.submitApplication(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobRoleApply.njk", {
			jobRoleId: expect.objectContaining({ jobRoleId: 25 }),
			canApply: true,
			errorMessage: "Unable to submit your application",
		});
	});

	it("should handle getAll with 401 error from service", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token", userRole: "USER" },
		});
		const res = createResponse();

		jobRoleService.getAll.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.getAll(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(req.session.userRole).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
	});

	it("should render applications with locations and status counts", async () => {
		const req = createRequest({ session: { jwtToken: "jwt-token" } });
		const res = createResponse();
		const jobRoles = [
			{ roleName: "Engineer", location: "Belfast" },
			{ roleName: "Designer", location: "London" },
		];
		const applications = [
			{
				applicationId: 1,
				applicantName: "Alex",
				applicantEmail: "alex@example.com",
				roleName: "Engineer",
				applicationDate: "2026-09-01",
				status: "pending",
			},
			{
				applicationId: 2,
				applicantName: "Blair",
				applicantEmail: "blair@example.com",
				roleName: "Designer",
				applicationDate: "2026-09-01",
				status: "approved",
			},
			{
				applicationId: 3,
				applicantName: "Casey",
				applicantEmail: "casey@example.com",
				roleName: "Unknown role",
				applicationDate: "2026-09-01",
				status: "rejected",
			},
		];

		jobRoleService.getAll.mockResolvedValueOnce(jobRoles);
		adminApplicationService.getAll.mockResolvedValueOnce(applications);

		await controller.getApplications(req as unknown as Request, res);

		expect(jobRoleService.getAll).toHaveBeenCalledWith("jwt-token");
		expect(adminApplicationService.getAll).toHaveBeenCalledWith("jwt-token");
		expect(res.render).toHaveBeenCalledWith("pages/jobApplicationAdmin.njk", {
			applications: [
				{ ...applications[0], location: "Belfast" },
				{ ...applications[1], location: "London" },
				{ ...applications[2], location: "Unknown" },
			],
			applicationCounts: { total: 3, pending: 1, approved: 1, rejected: 1 },
			filters: { search: "", status: "", role: "", location: "" },
			jobRoles,
		});
	});

	it("should filter applications from query parameters", async () => {
		const req = createRequest({
			session: { jwtToken: undefined },
			query: {
				search: "EXAMPLE.COM",
				status: "HIRED",
				role: "Engineer",
				location: "Belfast",
			},
		});
		const res = createResponse();
		const matchingApplication = {
			applicationId: 1,
			applicantName: "Alex",
			applicantEmail: "alex@example.com",
			roleName: "Engineer",
			applicationDate: "2026-09-01",
			status: "approved",
		};
		const excludedApplication = {
			...matchingApplication,
			applicationId: 2,
			applicantName: "Taylor",
			applicantEmail: "taylor@other.test",
		};

		jobRoleService.getAll.mockResolvedValueOnce([
			{ roleName: "Engineer", location: "Belfast" },
		]);
		adminApplicationService.getAll.mockResolvedValueOnce([
			matchingApplication,
			excludedApplication,
		]);

		await controller.getApplications(req as unknown as Request, res);

		expect(adminApplicationService.getAll).toHaveBeenCalledWith("");
		expect(res.render).toHaveBeenCalledWith(
			"pages/jobApplicationAdmin.njk",
			expect.objectContaining({
				applications: [{ ...matchingApplication, location: "Belfast" }],
				filters: {
					search: "example.com",
					status: "approved",
					role: "Engineer",
					location: "Belfast",
				},
			}),
		);
	});

	it("should redirect when loading applications returns 401", async () => {
		const req = createRequest({
			session: { jwtToken: "jwt-token", userRole: "ADMIN" },
		});
		const res = createResponse();
		adminApplicationService.getAll.mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 401 },
		});

		await controller.getApplications(req as unknown as Request, res);

		expect(req.session.jwtToken).toBeUndefined();
		expect(req.session.userRole).toBeUndefined();
		expect(res.redirect).toHaveBeenCalledWith("/login");
	});

	it("should render an application loading error", async () => {
		const req = createRequest();
		const res = createResponse();
		adminApplicationService.getAll.mockRejectedValueOnce("unknown");

		await controller.getApplications(req as unknown as Request, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.render).toHaveBeenCalledWith("pages/jobApplicationAdmin.njk", {
			applications: [],
			jobRoles: [],
			errorMessage: "Unable to load applications",
		});
	});

	it("should return all job role option lists", async () => {
		jobRoleService.getAllStatuses.mockResolvedValueOnce(["open"]);
		jobRoleService.getAllLocations.mockResolvedValueOnce(["Belfast"]);
		jobRoleService.getAllCapabilities.mockResolvedValueOnce(["Engineering"]);
		jobRoleService.getAllBands.mockResolvedValueOnce(["Senior"]);

		expect(await controller.getAllStatuses()).toEqual(["open"]);
		expect(await controller.getAllLocations()).toEqual(["Belfast"]);
		expect(await controller.getAllCapabilities()).toEqual(["Engineering"]);
		expect(await controller.getAllBands()).toEqual(["Senior"]);
	});

	it.each([
		["statuses", "getAllStatuses", "Failed to fetch job role statuses"],
		["locations", "getAllLocations", "Failed to fetch job role locations"],
		[
			"capabilities",
			"getAllCapabilities",
			"Failed to fetch job role capabilities",
		],
		["bands", "getAllBands", "Failed to fetch job role bands"],
	] as const)(
		"should normalize errors when fetching %s",
		async (_label, method, expectedMessage) => {
			const serviceMethod = jobRoleService[method];
			serviceMethod.mockRejectedValueOnce(new Error("backend failed"));

			await expect(controller[method]()).rejects.toThrow(expectedMessage);
		},
	);
});
