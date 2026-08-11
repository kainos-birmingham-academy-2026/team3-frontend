import { describe, expect, it } from "vitest";
import { getUserRoleFromToken } from "../../src/services/tokenPayloadService";

function createTokenWithPayload(payload: Record<string, unknown>): string {
	const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
	const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
	return `${header}.${body}.signature`;
}

describe("getUserRoleFromToken", () => {
	it("should return USER role from token payload", () => {
		const token = createTokenWithPayload({ role: "USER" });

		expect(getUserRoleFromToken(token)).toBe("USER");
	});

	it("should return RECRUITMENT_ADMIN role from token payload", () => {
		const token = createTokenWithPayload({ role: "RECRUITMENT_ADMIN" });

		expect(getUserRoleFromToken(token)).toBe("RECRUITMENT_ADMIN");
	});

	it("should return undefined for invalid token shape", () => {
		expect(getUserRoleFromToken("not-a-jwt")).toBeUndefined();
	});

	it("should return undefined when role claim is missing", () => {
		const token = createTokenWithPayload({ userId: 1 });

		expect(getUserRoleFromToken(token)).toBeUndefined();
	});
});
