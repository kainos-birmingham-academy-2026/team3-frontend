export interface JobRoleChatResponse {
	answer: string;
	roles: Array<{ jobRoleId: number; roleName: string }>;
}