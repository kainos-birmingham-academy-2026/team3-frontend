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

	it("should return ADMIN role from token payload", () => {
		const token = createTokenWithPayload({ role: "ADMIN" });

		expect(getUserRoleFromToken(token)).toBe("ADMIN");
	});

	it("should return undefined for invalid token shape", () => {
		expect(getUserRoleFromToken("not-a-jwt")).toBeUndefined();
	});

	it("should return undefined when role claim is missing", () => {
		const token = createTokenWithPayload({ userId: 1 });

		expect(getUserRoleFromToken(token)).toBeUndefined();
	});

	it("should return undefined when JWT payload is malformed", () => {
		const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
		const malformedPayload = "invalid-base64-&*#$";
		const token = `${header}.${malformedPayload}.signature`;

		expect(getUserRoleFromToken(token)).toBeUndefined();
	});

	it("should return undefined when payload JSON is invalid", () => {
		const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
		const invalidJson = Buffer.from("not-json").toString("base64url");
		const token = `${header}.${invalidJson}.signature`;

		expect(getUserRoleFromToken(token)).toBeUndefined();
	});

	it("should return undefined for unknown role values", () => {
		const token = createTokenWithPayload({ role: "SUPERUSER" });

		expect(getUserRoleFromToken(token)).toBeUndefined();
	});

	it("should return undefined when payload part is missing", () => {
		const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
		const token = `${header}..signature`;

		expect(getUserRoleFromToken(token)).toBeUndefined();
	});
});
