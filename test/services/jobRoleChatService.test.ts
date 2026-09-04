import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import { JobRoleChatService } from "../../src/services/jobRoleChatService";

vi.mock("../../src/config/apiClient", () => ({
	default: { post: vi.fn() },
}));

describe("JobRoleChatService", () => {
	beforeEach(() => vi.clearAllMocks());

	it("sends only the current question to the backend", async () => {
		vi.mocked(apiClient.post).mockResolvedValueOnce({
			data: {
				answer: "The Software Engineer role is based in Belfast.",
				roles: [
					{
						jobRoleId: 1,
						roleName: "Software Engineer",
						location: "Belfast",
						status: "OPEN",
						openPositions: 2,
						closingDate: "2026-10-01T00:00:00.000Z",
					},
				],
			},
		});
		const service = new JobRoleChatService();

		const result = await service.ask("Where is Software Engineer based?");

		expect(apiClient.post).toHaveBeenCalledWith("/api/job-role-chat", {
			message: "Where is Software Engineer based?",
		});
		expect(result.roles[0]?.jobRoleId).toBe(1);
	});
});
