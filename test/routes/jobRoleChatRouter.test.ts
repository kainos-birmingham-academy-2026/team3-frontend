import type { Application } from "express";
import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import jobRoleChatRouter from "../../src/routes/jobRoleChatRouter";

vi.mock("../../src/config/apiClient", () => ({
	default: { post: vi.fn() },
}));

describe("job role chat proxy", () => {
	let app: Application;

	beforeEach(() => {
		vi.clearAllMocks();
		app = express();
		app.use(express.json());
		app.use(jobRoleChatRouter);
	});

	it("is public and returns the backend answer", async () => {
		vi.mocked(apiClient.post).mockResolvedValueOnce({
			data: {
				answer: "The Software Engineer role is open.",
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

		const response = await request(app)
			.post("/api/job-role-chat")
			.send({ message: "Is Software Engineer open?" });

		expect(response.status).toBe(200);
		expect(response.body.roles[0].jobRoleId).toBe(1);
	});

	it.each([400, 429])(
		"preserves a safe backend %i response",
		async (status) => {
			const backendBody = { message: `Backend response ${status}` };
			vi.mocked(apiClient.post).mockRejectedValueOnce({
				isAxiosError: true,
				response: { status, data: backendBody },
			});

			const response = await request(app)
				.post("/api/job-role-chat")
				.send({ message: "What roles are open?" });

			expect(response.status).toBe(status);
			expect(response.body).toEqual(backendBody);
		},
	);

	it("replaces an unexpected backend error with a safe response", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			response: {
				status: 500,
				data: { message: "Internal database details" },
			},
		});

		const response = await request(app)
			.post("/api/job-role-chat")
			.send({ message: "What roles are open?" });

		expect(response.status).toBe(503);
		expect(response.body).toEqual({
			message: "The job role assistant is unavailable. Please try again later.",
		});
	});

	it("returns a safe response when the backend cannot be reached", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			message: "connect ECONNREFUSED",
		});

		const response = await request(app)
			.post("/api/job-role-chat")
			.send({ message: "What roles are open?" });

		expect(response.status).toBe(503);
		expect(response.body).toEqual({
			message: "The job role assistant is unavailable. Please try again later.",
		});
	});
});
