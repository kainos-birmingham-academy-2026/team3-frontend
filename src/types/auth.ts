export const USER_ROLES = {
	RECRUITMENT_ADMIN: "RECRUITMENT_ADMIN",
	USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];