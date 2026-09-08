export interface JobRoleChatResponse {
	answer: string;
	roles: Array<{
		jobRoleId: number;
		roleName: string;
		location: string;
		status: string;
		openPositions: number;
		closingDate: string | null;
	}>;
}
