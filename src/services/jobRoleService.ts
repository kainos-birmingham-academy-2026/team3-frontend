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
  status?: string;
  statusName?: string;
  description?: string;
  responsibilities?: string;
  sharepointUrl?: string;
  jobSpecUrl?: string;
  numberOfOpenPositions?: number;
  openPositions?: number;
  addressLine1?: string;
  addressLine2?: string;
  postcode?: string;
}

export class JobRoleService {
  private mapStatus(jobRole: ApiJobRole): string {
    const status = jobRole.status ?? jobRole.statusName;
    return status ? status.toLowerCase() : "unknown";
  }

  async getAll(jwtToken?: string): Promise<JobRole[]> {
    if (!jwtToken) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await apiClient.get<ApiJobRole[]>("/job-roles", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

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
          status: this.mapStatus(jobRole),
          description: jobRole.description,
          responsibilities: jobRole.responsibilities,
          jobSpecUrl: jobRole.sharepointUrl ?? jobRole.jobSpecUrl,
          openPositions: jobRole.numberOfOpenPositions ?? jobRole.openPositions,
          addressLine1: jobRole.addressLine1,
          addressLine2: jobRole.addressLine2,
          postcode: jobRole.postcode,
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

  async getById(jobRoleId: string, jwtToken?: string): Promise<JobRole> {
    try {
      const response = jwtToken
        ? await apiClient.get<ApiJobRole>(`/job-roles/${jobRoleId}`, {
            headers: { Authorization: `Bearer ${jwtToken}` },
          })
        : await apiClient.get<ApiJobRole>(`/job-roles/${jobRoleId}`);

      const jobRole = response.data;
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
        status: this.mapStatus(jobRole),
        description: jobRole.description,
        responsibilities: jobRole.responsibilities,
        jobSpecUrl: jobRole.sharepointUrl ?? jobRole.jobSpecUrl,
        openPositions: jobRole.numberOfOpenPositions ?? jobRole.openPositions,
        addressLine1: jobRole.addressLine1,
        addressLine2: jobRole.addressLine2,
        postcode: jobRole.postcode,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 404) {
          throw new Error(`Job role with ID ${jobRoleId} not found`);
        }
        if (status === 500) {
          throw new Error("Backend server error");
        }
      }

      throw error;
    }
  }
}