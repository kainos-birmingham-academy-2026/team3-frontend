import { USER_ROLES, type UserRole } from "../types/auth";

type JwtPayload = {
	role?: unknown;
};

function decodeBase64Url(input: string): string {
	const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
	const padding = (4 - (base64.length % 4)) % 4;
	return Buffer.from(base64 + "=".repeat(padding), "base64").toString("utf8");
}

export function getUserRoleFromToken(token: string): UserRole | undefined {
	const parts = token.split(".");

	if (parts.length !== 3) {
		return undefined;
	}

	try {
		const payloadText = decodeBase64Url(parts[1] ?? "");
		const payload = JSON.parse(payloadText) as JwtPayload;

		if (payload.role === USER_ROLES.RECRUITMENT_ADMIN) {
			return USER_ROLES.RECRUITMENT_ADMIN;
		}

		if (payload.role === USER_ROLES.APPLICANT) {
			return USER_ROLES.APPLICANT;
		}

		return undefined;
	} catch {
		return undefined;
 	}
}
