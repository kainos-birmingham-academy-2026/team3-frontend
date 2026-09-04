import apiClient from "../config/apiClient";
import type { Application } from "../models/application";

interface ApiApplication {
	applicationId: number;
	applicantEmail?: string;
	cvText?: string;
	application?: {
		cvText?: string;
	};
	jobRoleId?: number;
	roleName?: string;
	applicationDate?: string;
	status: string;
}

interface ApiApplicationPage {
	items: ApiApplication[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export interface ApplicationPage {
	items: Application[];
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

type StatusAction = "approve" | "reject";
type NormalizedStatus = "pending" | "approved" | "rejected" | "withdrawn";

export class AdminApplicationService {
	private static readonly ADMIN_APPLICATIONS_ENDPOINT =
		"/api/job-applications/admin";

	private getAuthHeaders(jwtToken: string): { Authorization: string } {
		return { Authorization: `Bearer ${jwtToken}` };
	}

	private extractCvTextFromUnknown(payload: unknown): string {
		if (typeof payload === "string") {
			return payload.trim();
		}

		if (!payload || typeof payload !== "object") {
			return "";
		}

		const application = payload as ApiApplication;
		return String(
			application.cvText ?? application.application?.cvText ?? "",
		).trim();
	}

	private mapStatus(status: string): NormalizedStatus {
		const normalizedStatus = status.trim().toLowerCase();

		if (normalizedStatus === "hired") {
			return "approved";
		}

		if (normalizedStatus === "rejected") {
			return "rejected";
		}

		if (normalizedStatus === "withdrawn") {
			return "withdrawn";
		}

		return "pending";
	}

	private mapApiApplicationToModel(app: ApiApplication): Application {
		return {
			applicationId: app.applicationId,
			applicantEmail: app.applicantEmail ?? "N/A",
			cvText: this.extractCvTextFromUnknown(app),
			jobRoleId: app.jobRoleId ?? null,
			roleName: app.roleName ?? "N/A",
			applicationDate: app.applicationDate
				? app.applicationDate.split("T")[0]
				: "Unknown",
			status: this.mapStatus(app.status),
		};
	}

	private getStatusValue(action: StatusAction): "HIRED" | "REJECTED" {
		return action === "approve" ? "HIRED" : "REJECTED";
	}

	async getPage(
		jwtToken?: string,
		page?: number,
		pageSize?: number,
	): Promise<ApplicationPage> {
		try {
			const response = await apiClient.get<ApiApplicationPage | ApiApplication[]>(
				AdminApplicationService.ADMIN_APPLICATIONS_ENDPOINT,
				{
					...(jwtToken
						? { headers: this.getAuthHeaders(jwtToken) }
						: {}),
					...(page && pageSize ? { params: { page, pageSize } } : {}),
				},
			);
			const responsePage = Array.isArray(response.data)
				? {
						items: response.data,
						page: 1,
						pageSize: response.data.length,
						totalItems: response.data.length,
						totalPages: response.data.length > 0 ? 1 : 0,
					}
				: response.data;

			return {
				...responsePage,
				items: responsePage.items.map((app) =>
					this.mapApiApplicationToModel(app),
				),
			};
		} catch (error) {
			throw new Error(
				`Failed to fetch applications: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	async getAll(jwtToken?: string): Promise<Application[]> {
		const page = await this.getPage(jwtToken);
		return page.items;
	}

	async getCvTextById(
		applicationId: number,
		jwtToken: string,
	): Promise<string> {
		const applications = await this.getAll(jwtToken);
		const application = applications.find(
			(item) => item.applicationId === applicationId,
		);
		return (application?.cvText ?? "").trim();
	}

	private async updateStatus(
		applicationId: number,
		action: StatusAction,
		jwtToken: string,
	): Promise<void> {
		const statusUrl = `${AdminApplicationService.ADMIN_APPLICATIONS_ENDPOINT}/${applicationId}/status`;

		await apiClient.request({
			method: "patch",
			url: statusUrl,
			data: { status: this.getStatusValue(action) },
			headers: this.getAuthHeaders(jwtToken),
		});
	}

	async approve(applicationId: number, jwtToken: string): Promise<void> {
		await this.updateStatus(applicationId, "approve", jwtToken);
	}

	async reject(applicationId: number, jwtToken: string): Promise<void> {
		await this.updateStatus(applicationId, "reject", jwtToken);
	}
}
