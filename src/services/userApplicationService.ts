import apiClient from "../config/apiClient";
import type { UserApplication } from "../models/userApplication";

interface ApiUserApplication {
	applicationId: number;
	jobRoleId: number;
	roleName: string;
	applicationDate: string;
	status: "IN_PROGRESS" | "HIRED" | "REJECTED" | "WITHDRAWN";
	cvText: string;
}

export class UserApplicationService {
	private mapStatus(
		status: ApiUserApplication["status"],
	): UserApplication["status"] {
		if (status === "HIRED") {
			return "approved";
		}

		if (status === "REJECTED") {
			return "rejected";
		}

		if (status === "WITHDRAWN") {
			return "withdrawn";
		}

		return "pending";
	}

	async getAll(jwtToken: string): Promise<UserApplication[]> {
		const response = await apiClient.get<ApiUserApplication[]>(
			"/job-applications",
			{
				headers: { Authorization: `Bearer ${jwtToken}` },
			},
		);

		return response.data.map((application) => ({
			applicationId: application.applicationId,
			jobRoleId: application.jobRoleId,
			roleName: application.roleName,
			applicationDate: application.applicationDate.split("T")[0] ?? "Unknown",
			status: this.mapStatus(application.status),
			cvText: application.cvText,
		}));
	}

	async withdraw(applicationId: number, jwtToken: string): Promise<void> {
		await apiClient.patch(
			`/job-applications/${applicationId}/withdraw`,
			{},
			{
				headers: { Authorization: `Bearer ${jwtToken}` },
			},
		);
	}
}
