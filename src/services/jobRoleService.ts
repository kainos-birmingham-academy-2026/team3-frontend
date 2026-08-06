import axios from "axios";
import apiClient from "../config/apiClient";

export interface JobRole {
  jobRoleId: number;
  roleName: string;
  location: string;
  capabilityId: number;
  bandId: number;
  closingDate: string;
  status: string;
}

export class JobRoleService {
  async getAll(): Promise<JobRole[]> {
    try {
      const response = await apiClient.get<JobRole[]>("/job-roles");

      return response.data.map((jobRole) => ({
        ...jobRole,
        closingDate: jobRole.closingDate.split("T")[0],
      }));
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