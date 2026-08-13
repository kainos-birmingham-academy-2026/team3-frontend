import apiClient from "../config/apiClient";
import type { Application } from "../models/application";
import axios from "axios";

interface ApiApplication {
  applicationId: number;
  applicantName?: string;
  applicantEmail?: string;
  jobRoleId?: number;
  roleName?: string;
  applicationDate?: string;
  status: string;
}

type StatusAction = "approve" | "reject";
type RequestMethod = "post" | "patch" | "put";

export class AdminApplicationService {
  private getAuthHeaders(jwtToken: string): { Authorization: string } {
    return { Authorization: `Bearer ${jwtToken}` };
  }

  private mapStatus(status: string): "pending" | "approved" | "rejected" {
    const normalizedStatus = status.trim().toLowerCase();

    if (
      normalizedStatus === "approved" ||
      normalizedStatus === "approve" ||
      normalizedStatus === "accepted" ||
      normalizedStatus === "success"
    ) {
      return "approved";
    }

    if (
      normalizedStatus === "rejected" ||
      normalizedStatus === "reject" ||
      normalizedStatus === "declined" ||
      normalizedStatus === "denied" ||
      normalizedStatus === "failed"
    ) {
      return "rejected";
    }

    return "pending";
  }

  async getAll(jwtToken?: string): Promise<Application[]> {
    try {
      const response = jwtToken
        ? await apiClient.get<ApiApplication[]>("/job-applications/admin", {
            headers: { Authorization: `Bearer ${jwtToken}` },
          })
        : await apiClient.get<ApiApplication[]>("/job-applications/admin");

      return response.data.map((app) => ({
        applicationId: app.applicationId,
        applicantName: app.applicantName ?? "N/A",
        applicantEmail: app.applicantEmail ?? "N/A",
        roleName: app.roleName ?? "N/A",
        applicationDate: app.applicationDate ? app.applicationDate.split("T")[0] : "Unknown",
        status: this.mapStatus(app.status),
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch applications: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private async updateStatusWithFallbacks(
    applicationId: number,
    action: StatusAction,
    jwtToken: string
  ): Promise<void> {
    const statusValue = action === "approve" ? "approved" : "rejected";
    const headers = this.getAuthHeaders(jwtToken);

    const statusUpper = statusValue.toUpperCase();
    const statusPayloads: Array<Record<string, string>> = [
      { status: statusValue },
      { status: statusUpper },
      { statusName: statusUpper },
      { applicationStatus: statusValue },
      { applicationStatus: statusUpper },
      { decision: statusValue },
      { action },
    ];

    const attempts: Array<{ method: RequestMethod; url: string; data: Record<string, string> | Record<string, never> }> = [
      { method: "post", url: `/job-applications/admin/${applicationId}/${action}`, data: {} },
      ...statusPayloads.map((payload) => ({
        method: "post" as const,
        url: `/job-applications/admin/${applicationId}/${action}`,
        data: payload,
      })),
      { method: "post", url: `/job-applications/${applicationId}/${action}`, data: {} },
      { method: "post", url: `/applications/${applicationId}/${action}`, data: {} },
      { method: "post", url: `/job-applications/admin/${applicationId}/status`, data: { status: statusValue } },
      ...statusPayloads.map((payload) => ({
        method: "post" as const,
        url: `/job-applications/admin/${applicationId}/status`,
        data: payload,
      })),
      { method: "patch", url: `/job-applications/admin/${applicationId}/status`, data: { status: statusValue } },
      { method: "patch", url: `/job-applications/${applicationId}/status`, data: { status: statusValue } },
      { method: "patch", url: `/applications/${applicationId}/status`, data: { status: statusValue } },
      { method: "patch", url: `/job-applications/admin/${applicationId}`, data: { status: statusValue } },
      { method: "patch", url: `/job-applications/${applicationId}`, data: { status: statusValue } },
      { method: "patch", url: `/applications/${applicationId}`, data: { status: statusValue } },
      { method: "put", url: `/job-applications/admin/${applicationId}/status`, data: { status: statusValue } },
      { method: "put", url: `/job-applications/${applicationId}/status`, data: { status: statusValue } },
      { method: "put", url: `/applications/${applicationId}/status`, data: { status: statusValue } },
    ];

    let lastNotFoundError: unknown;
    let lastBadRequestError: unknown;
    let lastConflictError: unknown;
    let lastMethodError: unknown;

    for (const attempt of attempts) {
      try {
        await apiClient.request({
          method: attempt.method,
          url: attempt.url,
          data: attempt.data,
          headers,
        });
        return;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            lastNotFoundError = error;
            continue;
          }
          if (error.response?.status === 400) {
            lastBadRequestError = error;
            continue;
          }
          if (error.response?.status === 409) {
            lastConflictError = error;
            continue;
          }
          if (error.response?.status === 405) {
            lastMethodError = error;
            continue;
          }
        }
        throw error;
      }
    }

    if (lastConflictError) {
      throw lastConflictError;
    }

    if (lastMethodError) {
      throw lastMethodError;
    }

    if (lastBadRequestError) {
      throw lastBadRequestError;
    }

    if (lastNotFoundError) {
      const attemptedEndpoints = attempts
        .map((attempt) => `${attempt.method.toUpperCase()} ${attempt.url}`)
        .join(", ");
      throw new Error(
        `No matching status update endpoint found. Tried: ${attemptedEndpoints}`
      );
    }

    throw new Error("No matching status update endpoint found");
  }

  async approve(applicationId: number, jwtToken: string): Promise<void> {
    await this.updateStatusWithFallbacks(applicationId, "approve", jwtToken);
  }

  async reject(applicationId: number, jwtToken: string): Promise<void> {
    await this.updateStatusWithFallbacks(applicationId, "reject", jwtToken);
  }
}
