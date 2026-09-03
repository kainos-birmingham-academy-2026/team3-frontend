import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import { UserApplicationService } from "../../src/services/userApplicationService";

vi.mock("../../src/config/apiClient", () => ({
	default: {
		get: vi.fn(),
		patch: vi.fn(),
	},
}));

describe("UserApplicationService", () => {
	const service = new UserApplicationService();
	const jwtToken = "user-token";

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should fetch and map the authenticated user's applications", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					applicationId: 1,
					jobRoleId: 2,
					roleName: "Software Engineer",
					applicationDate: "2026-09-02T10:30:00.000Z",
					status: "IN_PROGRESS",
					cvText: "Software engineering CV",
				},
				{
					applicationId: 3,
					jobRoleId: 4,
					roleName: "Delivery Manager",
					applicationDate: "2026-09-01T09:00:00.000Z",
					status: "HIRED",
					cvText: "Delivery management CV",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(apiClient.get).toHaveBeenCalledWith("/job-applications", {
			headers: { Authorization: `Bearer ${jwtToken}` },
		});
		expect(result).toEqual([
			{
				applicationId: 1,
				jobRoleId: 2,
				roleName: "Software Engineer",
				applicationDate: "2026-09-02",
				status: "pending",
				cvText: "Software engineering CV",
			},
			{
				applicationId: 3,
				jobRoleId: 4,
				roleName: "Delivery Manager",
				applicationDate: "2026-09-01",
				status: "approved",
				cvText: "Delivery management CV",
			},
		]);
	});

	it("should map rejected applications", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					applicationId: 5,
					jobRoleId: 6,
					roleName: "Test Engineer",
					applicationDate: "2026-08-31T09:00:00.000Z",
					status: "REJECTED",
					cvText: "Testing CV",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.status).toBe("rejected");
	});

	it("should map withdrawn applications", async () => {
		vi.mocked(apiClient.get).mockResolvedValueOnce({
			data: [
				{
					applicationId: 7,
					jobRoleId: 8,
					roleName: "Product Manager",
					applicationDate: "2026-08-30T09:00:00.000Z",
					status: "WITHDRAWN",
					cvText: "Product CV",
				},
			],
		});

		const result = await service.getAll(jwtToken);

		expect(result[0]?.status).toBe("withdrawn");
	});

	it("should withdraw an application using the authenticated endpoint", async () => {
		vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: {} });

		await service.withdraw(12, jwtToken);

		expect(apiClient.patch).toHaveBeenCalledWith(
			"/job-applications/12/withdraw",
			{},
			{ headers: { Authorization: `Bearer ${jwtToken}` } },
		);
	});
});
