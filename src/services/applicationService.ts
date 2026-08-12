import axios from "axios";
import apiClient from "../config/apiClient";

type SubmitApplicationParams = {
  jobRoleId: string;
  jwtToken?: string;
  cvBuffer: Buffer;
  cvFileName: string;
  cvMimeType: string;
  status: "in progress";
};

export class ApplicationService {
  async submitApplication(params: SubmitApplicationParams): Promise<void> {
    if (!params.jwtToken) {
      throw new Error("Not authenticated");
    }

    const submitPath = process.env.APPLICATION_SUBMIT_PATH ?? "/api/applications";
    const formData = new FormData();

    formData.append("jobRoleId", params.jobRoleId);
    formData.append("status", params.status);
    formData.append(
      "cv",
      new Blob([params.cvBuffer], {
        type: params.cvMimeType || "application/octet-stream",
      }),
      params.cvFileName,
    );

    try {
      await apiClient.post(submitPath, formData, {
        headers: {
          Authorization: `Bearer ${params.jwtToken}`,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 400) {
          throw new Error("Invalid application payload");
        }

        if (status === 404) {
          throw new Error(
            "Applications are currently unavailable. Please try again later.",
          );
        }

        if (status === 500) {
          throw new Error("Backend server error while submitting application");
        }
      }

      throw error;
    }
  }
}
