import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import { ApplicationService } from "../../src/services/applicationService";

vi.mock("../../src/config/apiClient", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("ApplicationService", () => {
  const service = new ApplicationService();
  const originalPath = process.env.APPLICATION_SUBMIT_PATH;

  beforeEach(() => {
    vi.clearAllMocks();

    if (originalPath === undefined) {
      delete process.env.APPLICATION_SUBMIT_PATH;
    } else {
      process.env.APPLICATION_SUBMIT_PATH = originalPath;
    }
  });

  it("should throw when JWT is missing", async () => {
    await expect(
      service.submitApplication({
        jobRoleId: "1",
        jwtToken: undefined,
        cvBuffer: Buffer.from("cv"),
        cvFileName: "cv.pdf",
        cvMimeType: "application/pdf",
        status: "in progress",
      }),
    ).rejects.toThrow("Not authenticated");
  });

  it("should submit to default endpoint", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

    await service.submitApplication({
      jobRoleId: "1",
      jwtToken: "jwt-token",
      cvBuffer: Buffer.from("cv"),
      cvFileName: "cv.pdf",
      cvMimeType: "application/pdf",
      status: "in progress",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/applications",
      expect.any(FormData),
      {
        headers: {
          Authorization: "Bearer jwt-token",
        },
      },
    );
  });

  it("should submit to configured endpoint", async () => {
    process.env.APPLICATION_SUBMIT_PATH = "/api/applications";
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

    await service.submitApplication({
      jobRoleId: "2",
      jwtToken: "jwt-token",
      cvBuffer: Buffer.from("cv"),
      cvFileName: "cv.pdf",
      cvMimeType: "application/pdf",
      status: "in progress",
    });

    expect(apiClient.post).toHaveBeenCalledWith(
      "/api/applications",
      expect.any(FormData),
      expect.any(Object),
    );
  });

  it("should map known backend errors", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400 },
    });

    await expect(
      service.submitApplication({
        jobRoleId: "1",
        jwtToken: "jwt-token",
        cvBuffer: Buffer.from("cv"),
        cvFileName: "cv.pdf",
        cvMimeType: "application/pdf",
        status: "in progress",
      }),
    ).rejects.toThrow("Invalid application payload");

    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });

    await expect(
      service.submitApplication({
        jobRoleId: "1",
        jwtToken: "jwt-token",
        cvBuffer: Buffer.from("cv"),
        cvFileName: "cv.pdf",
        cvMimeType: "application/pdf",
        status: "in progress",
      }),
    ).rejects.toThrow("Application endpoint not found");
  });
});
