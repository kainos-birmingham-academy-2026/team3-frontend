import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import { AdminApplicationService } from "../../src/services/adminApplicationService";

vi.mock("../../src/config/apiClient", () => ({
  default: {
    get: vi.fn(),
    request: vi.fn(),
  },
}));

describe("AdminApplicationService", () => {
  const service = new AdminApplicationService();
  const jwtToken = "test-jwt-token";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should request applications list from admin endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        {
          applicationId: 7,
          applicantName: "Jane Doe",
          applicantEmail: "jane@example.com",
          roleName: "Engineer",
          applicationDate: "2026-08-12T00:00:00.000Z",
          status: "PENDING",
        },
      ],
    });

    const result = await service.getAll(jwtToken);

    expect(apiClient.get).toHaveBeenCalledWith("/job-applications/admin", {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    expect(result[0]?.status).toBe("pending");
    expect(result[0]?.applicationDate).toBe("2026-08-12");
  });

  it("should map cvText from nested payload fields", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        {
          applicationId: 8,
          applicantName: "Jane Doe",
          applicantEmail: "jane@example.com",
          roleName: "Engineer",
          applicationDate: "2026-08-12T00:00:00.000Z",
          status: "APPROVED",
          application: {
            cvText: "Nested CV",
          },
        },
      ],
    });

    const result = await service.getAll(jwtToken);

    expect(result[0]?.cvText).toBe("Nested CV");
    expect(result[0]?.status).toBe("approved");
  });

  it("should map status aliases correctly", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        {
          applicationId: 9,
          applicantName: "Jane Doe",
          applicantEmail: "jane@example.com",
          roleName: "Engineer",
          applicationDate: "2026-08-12T00:00:00.000Z",
          status: "hired",
        },
        {
          applicationId: 10,
          applicantName: "John Doe",
          applicantEmail: "john@example.com",
          roleName: "Engineer",
          applicationDate: "2026-08-12T00:00:00.000Z",
          status: "rejected",
        },
      ],
    });

    const result = await service.getAll(jwtToken);

    expect(result[0]?.status).toBe("approved");
    expect(result[1]?.status).toBe("rejected");
  });

  it("should return cv text from first matching detail endpoint", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        cvText: "Detailed CV",
      },
    });

    const result = await service.getCvTextById(99, jwtToken);

    expect(result).toBe("Detailed CV");
    expect(apiClient.get).toHaveBeenCalledWith("/job-applications/admin/99/cv-text", {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  });

  it("should continue on 404 and fallback to list cv text", async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockResolvedValueOnce({
        data: [
          {
            applicationId: 7,
            applicantName: "A",
            applicantEmail: "a@example.com",
            roleName: "Engineer",
            applicationDate: "2026-08-12T00:00:00.000Z",
            status: "pending",
            cvText: "Fallback CV",
          },
        ],
      });

    const result = await service.getCvTextById(7, jwtToken);

    expect(result).toBe("Fallback CV");
  });

  it("should throw non-404 errors while fetching cv text", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500 },
      message: "server error",
    });

    await expect(service.getCvTextById(7, jwtToken)).rejects.toMatchObject({
      response: { status: 500 },
    });
  });

  it("should fallback to list data when detail endpoints return no cv text", async () => {
    vi.mocked(apiClient.get).mockImplementation(async (url) => {
      if (url === "/job-applications/admin") {
        return {
          data: [
            {
              applicationId: 7,
              applicantName: "A",
              applicantEmail: "a@example.com",
              roleName: "Engineer",
              applicationDate: "2026-08-12T00:00:00.000Z",
              status: "pending",
              cvText: "List CV text",
            },
          ],
        };
      }

      return { data: { foo: "bar" } };
    });

    const result = await service.getCvTextById(7, jwtToken);

    expect(result).toBe("List CV text");
  });

  it("should return empty string when no cv text exists anywhere", async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValue({ data: {} });

    const result = await service.getCvTextById(404, jwtToken);

    expect(result).toBe("");
  });

  it("should approve via PATCH on the admin status endpoint", async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({ data: {} });

    await service.approve(42, jwtToken);

    expect(apiClient.request).toHaveBeenCalledTimes(1);
    expect(apiClient.request).toHaveBeenCalledWith({
      method: "patch",
      url: "/job-applications/admin/42/status",
      data: { status: "APPROVED" },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  });

  it("should reject via PATCH on the admin status endpoint", async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({ data: {} });

    await service.reject(42, jwtToken);

    expect(apiClient.request).toHaveBeenCalledTimes(1);
    expect(apiClient.request).toHaveBeenCalledWith({
      method: "patch",
      url: "/job-applications/admin/42/status",
      data: { status: "REJECTED" },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  });

  it("should propagate errors from the status endpoint", async () => {
    const conflictError = {
      isAxiosError: true,
      response: { status: 409 },
      message: "conflict",
    };
    vi.mocked(apiClient.request).mockRejectedValueOnce(conflictError);

    await expect(service.approve(42, jwtToken)).rejects.toBe(conflictError);
  });
});
