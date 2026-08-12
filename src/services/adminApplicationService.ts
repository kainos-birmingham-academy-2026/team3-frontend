import apiClient from "../config/apiClient";
import type { Application } from "../models/application";

interface ApiApplication {
  applicationId: number;
  applicantName: string;
  applicantEmail: string;
  jobRoleId: number;
  roleName: string;
  applicationDate: string;
  status: string;
}

export class AdminApplicationService {
  private mapStatus(status: string): "pending" | "approved" | "rejected" {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus === "approved") return "approved";
    if (normalizedStatus === "rejected") return "rejected";
    return "pending";
  }

  async getAll(jwtToken?: string): Promise<Application[]> {
    try {
      const response = jwtToken
        ? await apiClient.get<ApiApplication[]>("/applications", {
            headers: { Authorization: `Bearer ${jwtToken}` },
          })
        : await apiClient.get<ApiApplication[]>("/applications");

      return response.data.map((app) => ({
        applicationId: app.applicationId,
        applicantName: app.applicantName,
        applicantEmail: app.applicantEmail,
        roleName: app.roleName,
        applicationDate: app.applicationDate.split("T")[0] ?? app.applicationDate,
        status: this.mapStatus(app.status),
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch applications: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async approve(applicationId: number, jwtToken: string): Promise<void> {
    try {
      await apiClient.post(
        `/applications/${applicationId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to approve application: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async reject(applicationId: number, jwtToken: string): Promise<void> {
    try {
      await apiClient.post(
        `/applications/${applicationId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to reject application: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
