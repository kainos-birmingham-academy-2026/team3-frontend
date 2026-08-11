import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdmin, requireAuth } from "../../src/middleware/authMiddleware";

type MockRequest = Partial<Request> & {
	session: {
		jwtToken?: string;
		userRole?: "ADMIN" | "USER";
	};
};

function createResponse(): Response {
	return {
		redirect: vi.fn(),
	} as unknown as Response;
}

describe("authMiddleware", () => {
	let next: NextFunction;

	beforeEach(() => {
		next = vi.fn();
	});

	it("requireAuth should redirect to login when token is missing", () => {
		const req = { session: {} } as MockRequest;
		const res = createResponse();

		requireAuth(req as Request, res, next);

		expect(res.redirect).toHaveBeenCalledWith("/login");
		expect(next).not.toHaveBeenCalled();
	});

	it("requireAuth should call next when token exists", () => {
		const req = { session: { jwtToken: "jwt-token" } } as MockRequest;
		const res = createResponse();

		requireAuth(req as Request, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(res.redirect).not.toHaveBeenCalled();
	});

	it("requireAdmin should redirect non-admin users", () => {
		const req = {
			session: { jwtToken: "jwt-token", userRole: "USER" },
		} as MockRequest;
		const res = createResponse();

		requireAdmin(req as Request, res, next);

		expect(res.redirect).toHaveBeenCalledWith("/job-role-list");
		expect(next).not.toHaveBeenCalled();
	});

	it("requireAdmin should call next for admin users", () => {
		const req = {
			session: { jwtToken: "jwt-token", userRole: "ADMIN" },
		} as MockRequest;
		const res = createResponse();

		requireAdmin(req as Request, res, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(res.redirect).not.toHaveBeenCalled();
	});
});
