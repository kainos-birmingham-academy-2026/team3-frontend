export type AdminHireWorld = {
	adminEmail: string;
	adminPassword: string;
	pendingBeforeHire?: number;
};

export function createAdminHireWorld(): AdminHireWorld {
	return {
		adminEmail: "test@example.com",
		adminPassword: "password",
	};
}