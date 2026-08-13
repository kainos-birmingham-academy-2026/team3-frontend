import apiClient from "../config/apiClient";
import type { Application } from "../models/application";
import axios from "axios";

interface ApiApplication {
  applicationId: number;
  applicantName?: string;
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

type StatusAction = "approve" | "reject";
type NormalizedStatus = "pending" | "approved" | "rejected";

export class AdminApplicationService {
  private static readonly ADMIN_APPLICATIONS_ENDPOINT = "/job-applications/admin";

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
    return String(application.cvText ?? application.application?.cvText ?? "").trim();
  }

  private mapStatus(status: string): NormalizedStatus {
    const normalizedStatus = status.trim().toLowerCase();

    if (
      normalizedStatus === "hired" ||
      normalizedStatus === "approved"
    ) {
      return "approved";
    }

    if (
      normalizedStatus === "rejected"
    ) {
      return "rejected";
    }

    return "pending";
  }

  private mapApiApplicationToModel(app: ApiApplication): Application {
    return {
      applicationId: app.applicationId,
      applicantName: app.applicantName ?? "N/A",
      applicantEmail: app.applicantEmail ?? "N/A",
      cvText: this.extractCvTextFromUnknown(app),
      jobRoleId: app.jobRoleId ?? null,
      roleName: app.roleName ?? "N/A",
      applicationDate: app.applicationDate ? app.applicationDate.split("T")[0] : "Unknown",
      status: this.mapStatus(app.status),
    };
  }

  private getStatusValue(action: StatusAction): "approved" | "rejected" {
    return action === "approve" ? "approved" : "rejected";
  }

  async getAll(jwtToken?: string): Promise<Application[]> {
    try {
      const response = jwtToken
        ? await apiClient.get<ApiApplication[]>(AdminApplicationService.ADMIN_APPLICATIONS_ENDPOINT, {
            headers: this.getAuthHeaders(jwtToken),
          })
        : await apiClient.get<ApiApplication[]>(AdminApplicationService.ADMIN_APPLICATIONS_ENDPOINT);

      return response.data.map((app) => this.mapApiApplicationToModel(app));
    } catch (error) {
      throw new Error(
        `Failed to fetch applications: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async getCvTextById(applicationId: number, jwtToken: string): Promise<string> {
    const headers = this.getAuthHeaders(jwtToken);
    const cvEndpoint = `${AdminApplicationService.ADMIN_APPLICATIONS_ENDPOINT}/${applicationId}/cv-text`;

    try {
      const response = await apiClient.get<unknown>(cvEndpoint, { headers });
      const cvText = this.extractCvTextFromUnknown(response.data);
      if (cvText) {
        return cvText;
      }
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }

    try {
      const applications = await this.getAll(jwtToken);
      const application = applications.find((item) => item.applicationId === applicationId);
      const listCvText = (application?.cvText ?? "").trim();
      if (listCvText) {
        return listCvText;
      }
    } catch {
    }

    return "";
  }

  private async updateStatusWithFallbacks(
    applicationId: number,
    action: StatusAction,
    jwtToken: string
  ): Promise<void> {
    const statusValue = this.getStatusValue(action);
    const headers = this.getAuthHeaders(jwtToken);
    const actionUrl = `${AdminApplicationService.ADMIN_APPLICATIONS_ENDPOINT}/${applicationId}/${action}`;
    const statusUrl = `${AdminApplicationService.ADMIN_APPLICATIONS_ENDPOINT}/${applicationId}/status`;

    try {
      await apiClient.request({
        method: "post",
        url: actionUrl,
        data: {},
        headers,
      });
      return;
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }
    }

    try {
      await apiClient.request({
        method: "post",
        url: statusUrl,
        data: { status: statusValue },
        headers,
      });
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 404) {
        throw error;
      }

      throw new Error("No matching status update endpoint found");
    }
  }

  async approve(applicationId: number, jwtToken: string): Promise<void> {
    await this.updateStatusWithFallbacks(applicationId, "approve", jwtToken);
  }

  async reject(applicationId: number, jwtToken: string): Promise<void> {
    await this.updateStatusWithFallbacks(applicationId, "reject", jwtToken);
  }
}
