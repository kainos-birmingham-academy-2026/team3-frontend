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
				roles: [{ jobRoleId: 1, roleName: "Software Engineer" }],
			},
		});

		const response = await request(app)
			.post("/api/job-role-chat")
			.send({ message: "Is Software Engineer open?" });

		expect(response.status).toBe(200);
		expect(response.body.roles[0].jobRoleId).toBe(1);
	});
});
