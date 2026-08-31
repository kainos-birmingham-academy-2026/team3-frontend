import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import { JobRoleService } from "../../src/services/jobRoleService";

vi.mock("../../src/config/apiClient", () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe("JobRoleService", () => {
	const service = new JobRoleService();
	const jwtToken = "test-jwt-token";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should convert closingDate from datetime to date-only", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
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
		});

		const result = await service.getAll(jwtToken);

		expect(apiClient.get).toHaveBeenCalledWith("/job-roles", {
			headers: { Authorization: `Bearer ${jwtToken}` },
		});
		expect(result[0]?.closingDate).toBe("2026-08-06");
		expect(result[0]?.status).toBe("open");
		expect(result[0]?.capability).toBe("Software Engineering");
	});

	it("should fetch public job roles without authorization header", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
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
		});

		const result = await service.getAll();

		expect(apiClient.get).toHaveBeenCalledWith("/job-roles");
		expect(result).toHaveLength(1);
		expect(result[0]?.status).toBe("open");
	});

	it("should send role filters as API query parameters", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

		await service.getAll(undefined, {
			roleName: "Engineer",
			locationId: ["1", "2"],
			capabilityId: ["3"],
			bandId: ["4"],
			closingDate: "2026-12-31",
		});

		const config = vi.mocked(apiClient.get).mock.calls[0]?.[1];
		expect(config?.params.toString()).toBe(
			"roleName=Engineer&closingDate=2026-12-31&locationId=1&locationId=2&capabilityId=3&bandId=4",
		);
	});

	it("should keeps role status values from backend for view filtering", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
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
				{
					jobRoleId: 2,
					roleName: "Delivery Manager",
					locationName: "Leeds",
					capabilityName: "Delivery Management",
					bandName: "Senior Engineer",
					closingDate: "2026-09-01T00:00:00.000Z",
					status: "CLOSED",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.status).toBe("open");
		expect(result[1]?.status).toBe("closed");
	});

	it("should read statusName when status is not present", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					locationName: "Birmingham",
					capabilityName: "Software Engineering",
					bandName: "Engineer",
					closingDate: "2026-08-06T00:00:00.000Z",
					statusName: "OPEN",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.status).toBe("open");
	});

	it("should throw a friendly message when backend returns 404", async () => {
		vi.mocked(apiClient.get).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
		});

		await expect(service.getAll(jwtToken)).rejects.toThrow(
			"No job roles found",
		);
	});

	it("should throw a friendly message when backend returns 500", async () => {
		vi.mocked(apiClient.get).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 500 },
		});

		await expect(service.getAll(jwtToken)).rejects.toThrow(
			"Job roles cannot be loaded right now. Please try again in a moment.",
		);
	});

	it("should map sharepointUrl to jobSpecUrl for getAll", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					locationName: "Birmingham",
					capabilityName: "Software Engineering",
					bandName: "Engineer",
					closingDate: "2026-08-06T00:00:00.000Z",
					status: "OPEN",
					sharepointUrl: "https://sharepoint.com/jobs/engineer",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.jobSpecUrl).toBe("https://sharepoint.com/jobs/engineer");
	});

	it("should map numberOfOpenPositions to openPositions", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					locationName: "Birmingham",
					capabilityName: "Software Engineering",
					bandName: "Engineer",
					closingDate: "2026-08-06T00:00:00.000Z",
					status: "OPEN",
					numberOfOpenPositions: 3,
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.openPositions).toBe(3);
	});

	it("should include responsibilities in response", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					locationName: "Birmingham",
					capabilityName: "Software Engineering",
					bandName: "Engineer",
					closingDate: "2026-08-06T00:00:00.000Z",
					status: "OPEN",
					responsibilities: "Build and maintain software systems",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.responsibilities).toBe(
			"Build and maintain software systems",
		);
	});

	it("should map address fields for getAll", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					locationName: "Birmingham",
					capabilityName: "Software Engineering",
					bandName: "Engineer",
					closingDate: "2026-08-06T00:00:00.000Z",
					status: "OPEN",
					addressLine1: "123 Business Street",
					addressLine2: "Suite 100",
					postcode: "B1 1AA",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.addressLine1).toBe("123 Business Street");
		expect(result[0]?.addressLine2).toBe("Suite 100");
		expect(result[0]?.postcode).toBe("B1 1AA");
	});

	it("should retrieve job role by ID with all detailed fields", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 1,
				roleName: "Software Engineer",
				locationName: "Birmingham",
				capabilityName: "Software Engineering",
				bandName: "Engineer",
				closingDate: "2026-08-06T00:00:00.000Z",
				statusName: "OPEN",
				description: "We are looking for a talented Software Engineer",
				responsibilities: "Build and maintain software systems",
				sharepointUrl: "https://sharepoint.com/jobs/engineer",
				numberOfOpenPositions: 2,
				addressLine1: "123 Business Street",
				addressLine2: "Suite 100",
				postcode: "B1 1AA",
			},
		});

		const result = await service.getById("1", jwtToken);

		expect(apiClient.get).toHaveBeenCalledWith("/job-roles/1", {
			headers: { Authorization: `Bearer ${jwtToken}` },
		});
		expect(result?.jobRoleId).toBe(1);
		expect(result?.description).toBe(
			"We are looking for a talented Software Engineer",
		);
		expect(result?.responsibilities).toBe(
			"Build and maintain software systems",
		);
		expect(result?.jobSpecUrl).toBe("https://sharepoint.com/jobs/engineer");
		expect(result?.openPositions).toBe(2);
		expect(result?.addressLine1).toBe("123 Business Street");
	});

	it("should handle missing optional fields in getById", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 1,
				roleName: "Software Engineer",
				locationName: "Birmingham",
				capabilityName: "Software Engineering",
				bandName: "Engineer",
				closingDate: "2026-08-06T00:00:00.000Z",
				statusName: "OPEN",
			},
		});

		const result = await service.getById("1", jwtToken);

		expect(result?.description).toBeUndefined();
		expect(result?.responsibilities).toBeUndefined();
		expect(result?.jobSpecUrl).toBeUndefined();
		expect(result?.openPositions).toBeUndefined();
		expect(result?.addressLine1).toBeUndefined();
	});

	it("should send authorization header when token is provided", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					jobRoleId: 9,
					roleName: "Platform Engineer",
					closingDate: "2026-10-01T00:00:00.000Z",
				},
			],
		});

		await service.getAll("jwt-token");

		expect(apiClient.get).toHaveBeenCalledWith("/job-roles", {
			headers: { Authorization: "Bearer jwt-token" },
		});
	});

	it("should use fallback values for missing location, capability, and band", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					jobRoleId: 10,
					roleName: "Data Engineer",
					closingDate: "2026-11-12T00:00:00.000Z",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.location).toBe("Unknown");
		expect(result[0]?.capability).toBe("Unknown");
		expect(result[0]?.band).toBe("Unknown");
		expect(result[0]?.status).toBe("unknown");
	});

	it("should map id-based capability, band, openPositions and jobSpecUrl fallback", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 11,
				roleName: "Delivery Lead",
				closingDate: "2026-12-20T00:00:00.000Z",
				capabilityId: 44,
				bandId: 7,
				status: "OPEN",
				jobSpecUrl: "https://example.com/spec",
				openPositions: 5,
			},
		});

		const result = await service.getById("11");

		expect(result.capability).toBe("44");
		expect(result.band).toBe("7");
		expect(result.jobSpecUrl).toBe("https://example.com/spec");
		expect(result.openPositions).toBe(5);
	});

	it("should throw a friendly message when getById returns 404", async () => {
		vi.mocked(apiClient.get).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
		});

		await expect(service.getById("999")).rejects.toThrow(
			"Job role with ID 999 not found",
		);
	});

	it("should throw a friendly message when getById returns 500", async () => {
		vi.mocked(apiClient.get).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 500 },
		});

		await expect(service.getById("123")).rejects.toThrow(
			"This job role cannot be loaded right now. Please try again in a moment.",
		);
	});

	it("should submit an application with cvText payload", async () => {
		vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

		await service.applyForRole("3", "I am interested in this role", jwtToken);

		expect(apiClient.post).toHaveBeenCalledWith(
			"/job-roles/3/apply",
			{ cvText: "I am interested in this role" },
			{ headers: { Authorization: `Bearer ${jwtToken}` } },
		);
	});

	it("should throw when submitting an application without jwt token", async () => {
		await expect(service.applyForRole("3", "CV text")).rejects.toThrow(
			"Please sign in to continue",
		);
		expect(apiClient.post).not.toHaveBeenCalled();
	});

	it("should delete a job role with an authorization header", async () => {
		vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

		await service.deleteJobRole("3", jwtToken);

		expect(apiClient.delete).toHaveBeenCalledWith("/job-roles/3", {
			headers: { Authorization: `Bearer ${jwtToken}` },
		});
	});

	it("should throw when deleting a job role without a token", async () => {
		await expect(service.deleteJobRole("3")).rejects.toThrow(
			"Not authenticated",
		);
		expect(apiClient.delete).not.toHaveBeenCalled();
	});

	it("should handle getById without jwtToken and retrieve public job role", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 5,
				roleName: "Product Manager",
				closingDate: "2026-09-15T00:00:00.000Z",
				status: "OPEN",
			},
		});

		const result = await service.getById("5");

		expect(apiClient.get).toHaveBeenCalledWith("/job-roles/5");
		expect(result.jobRoleId).toBe(5);
		expect(result.roleName).toBe("Product Manager");
	});

	it("should handle getById 404 without jwtToken", async () => {
		vi.mocked(apiClient.get).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
		});

		await expect(service.getById("999")).rejects.toThrow(
			"Job role with ID 999 not found",
		);
	});

	it("should re-throw non-axios errors in getAll", async () => {
		vi.mocked(apiClient.get).mockRejectedValueOnce(
			new Error("Network timeout"),
		);

		await expect(service.getAll(jwtToken)).rejects.toThrow("Network timeout");
	});

	it("should re-throw non-axios errors in getById", async () => {
		vi.mocked(apiClient.get).mockRejectedValueOnce(
			new Error("Unexpected error"),
		);

		await expect(service.getById("1")).rejects.toThrow("Unexpected error");
	});

	it("should use fallback jobSpecUrl when neither sharepointUrl nor jobSpecUrl provided", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 1,
				roleName: "Software Engineer",
				closingDate: "2026-08-06T00:00:00.000Z",
				status: "OPEN",
			},
		});

		const result = await service.getById("1");

		expect(result.jobSpecUrl).toBeUndefined();
	});

	it("should use fallback openPositions when both numberOfOpenPositions and openPositions undefined", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 1,
				roleName: "Software Engineer",
				closingDate: "2026-08-06T00:00:00.000Z",
				status: "OPEN",
			},
		});

		const result = await service.getById("1");

		expect(result.openPositions).toBeUndefined();
	});

	it("should use jobSpecUrl fallback instead of sharepointUrl when present", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 1,
				roleName: "Software Engineer",
				closingDate: "2026-08-06T00:00:00.000Z",
				status: "OPEN",
				jobSpecUrl: "https://spec.example.com/job",
			},
		});

		const result = await service.getById("1");

		expect(result.jobSpecUrl).toBe("https://spec.example.com/job");
	});

	it("should use bandId as string when bandName not provided", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 1,
				roleName: "Software Engineer",
				closingDate: "2026-08-06T00:00:00.000Z",
				bandId: 5,
			},
		});

		const result = await service.getById("1");

		expect(result.band).toBe("5");
	});

	it("should use bandName when both bandName and bandId provided", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 1,
				roleName: "Software Engineer",
				closingDate: "2026-08-06T00:00:00.000Z",
				bandName: "Senior Engineer",
				bandId: 5,
			},
		});

		const result = await service.getById("1");

		expect(result.band).toBe("Senior Engineer");
	});

	it("should map openPositions when numberOfOpenPositions provided", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: {
				jobRoleId: 1,
				roleName: "Software Engineer",
				closingDate: "2026-08-06T00:00:00.000Z",
				numberOfOpenPositions: 4,
			},
		});

		const result = await service.getById("1");

		expect(result.openPositions).toBe(4);
	});

	it("should create a job role with numeric fields and authorization", async () => {
		vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

		await service.createJobRole(
			{
				roleName: "Software Engineer",
				description: "Build software products",
				responsibilities: "Collaborate with the delivery team",
				sharepointUrl: "https://example.com/spec",
				numberOfOpenPositions: "2",
				closingDate: "2026-12-31",
				capabilityId: "4",
				bandId: 5,
				locationId: "6",
			},
			jwtToken,
		);

		expect(apiClient.post).toHaveBeenCalledWith(
			"/job-roles/create",
			{
				roleName: "Software Engineer",
				description: "Build software products",
				responsibilities: "Collaborate with the delivery team",
				sharepointUrl: "https://example.com/spec",
				numberOfOpenPositions: 2,
				closingDate: "2026-12-31",
				capabilityId: 4,
				bandId: 5,
				locationId: 6,
			},
			{
				headers: {
					Authorization: `Bearer ${jwtToken}`,
					"Content-Type": "application/json",
				},
			},
		);
	});

	it("should omit empty optional numeric fields and closing date when creating a role", async () => {
		vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

		await service.createJobRole(
			{
				roleName: "Delivery Manager",
				numberOfOpenPositions: "",
				capabilityId: "",
				bandId: undefined,
				locationId: "",
				closingDate: "",
			},
			jwtToken,
		);

		expect(apiClient.post).toHaveBeenCalledWith(
			"/job-roles/create",
			{
				roleName: "Delivery Manager",
				numberOfOpenPositions: undefined,
				capabilityId: undefined,
				bandId: undefined,
				locationId: undefined,
				closingDate: undefined,
			},
			expect.anything(),
		);
	});

	it("should reject creating a job role without a JWT token", async () => {
		await expect(
			service.createJobRole({ roleName: "Software Engineer" }),
		).rejects.toThrow("Not authenticated");
		expect(apiClient.post).not.toHaveBeenCalled();
	});

	it("should update a job role with converted numeric fields and authorization", async () => {
		vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: {} });

		await service.updateJobRole(
			{
				jobRoleId: "7",
				roleName: "Lead Engineer",
				description: "Lead delivery",
				responsibilities: "Coach engineers",
				sharepointUrl: "https://example.com/lead-role",
				numberOfOpenPositions: "3",
				closingDate: "2099-12-31",
				capabilityId: "4",
				bandId: "5",
				locationId: "6",
			},
			jwtToken,
		);

		expect(apiClient.patch).toHaveBeenCalledWith(
			"/job-roles/7",
			{
				roleName: "Lead Engineer",
				description: "Lead delivery",
				responsibilities: "Coach engineers",
				sharepointUrl: "https://example.com/lead-role",
				numberOfOpenPositions: 3,
				closingDate: "2099-12-31",
				capabilityId: 4,
				bandId: 5,
				locationId: 6,
			},
			{
				headers: {
					Authorization: `Bearer ${jwtToken}`,
					"Content-Type": "application/json",
				},
			},
		);
	});

	it("should reject updating a job role without a JWT token", async () => {
		await expect(service.updateJobRole({ jobRoleId: 7 })).rejects.toThrow(
			"Not authenticated",
		);
		expect(apiClient.patch).not.toHaveBeenCalled();
	});
});
