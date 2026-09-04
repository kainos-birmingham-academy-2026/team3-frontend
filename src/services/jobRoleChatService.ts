import apiClient from "../config/apiClient";
import type { JobRoleChatResponse } from "../models/jobRoleChat";

export class JobRoleChatService {
	async ask(message: string): Promise<JobRoleChatResponse> {
		const response = await apiClient.post<JobRoleChatResponse>(
			"/api/job-role-chat",
			{ message },
		);
		return response.data;
	}
}
