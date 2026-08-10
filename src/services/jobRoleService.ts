import axios from "axios";
import apiClient from "../config/apiClient";
import type { JobRole } from "../models/jobRole";

interface ApiJobRole {
  jobRoleId: number;
  roleName: string;
  location?: string;
  locationName?: string;
  capabilityName?: string;
  capabilityId?: number;
  bandName?: string;
  bandId?: number;
  closingDate: string;
  status: string;
}

export class JobRoleService {
  async getAll(): Promise<JobRole[]> {
    try {
      const response = await apiClient.get<ApiJobRole[]>("/job-roles");

      return response.data.map((jobRole) => {
        const closingDate = jobRole.closingDate.split("T")[0] ?? jobRole.closingDate;

        return {
          jobRoleId: jobRole.jobRoleId,
          roleName: jobRole.roleName,
          location: jobRole.location ?? jobRole.locationName ?? "Unknown",
          capability:
            jobRole.capabilityName ??
            (jobRole.capabilityId !== undefined ? String(jobRole.capabilityId) : "Unknown"),
          band:
            jobRole.bandName ?? (jobRole.bandId !== undefined ? String(jobRole.bandId) : "Unknown"),
          closingDate,
          status: jobRole.status.toLowerCase(),
        };
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) {
          throw new Error("No job roles found");
        }
        if (status === 500) {
          throw new Error("Backend server error");
        }
      }

      throw error;
    }
  }
}