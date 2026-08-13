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

  it("should call approve endpoint with admin-scoped path first", async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({ data: {} });

    await service.approve(42, jwtToken);

    expect(apiClient.request).toHaveBeenNthCalledWith(1, {
      method: "post",
      url: "/job-applications/admin/42/approve",
      data: {},
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  });

  it("should fallback approve endpoint to non-admin path when admin path returns 404", async () => {
    vi.mocked(apiClient.request)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockResolvedValueOnce({ data: {} });

    await service.approve(42, jwtToken);

    const calls = vi.mocked(apiClient.request).mock.calls.map(([arg]) => arg);
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          method: "post",
          url: "/job-applications/admin/42/approve",
          data: {},
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      ])
    );
  });

  it("should fallback approve to legacy path after two 404s", async () => {
    vi.mocked(apiClient.request)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockResolvedValueOnce({ data: {} });

    await service.approve(42, jwtToken);

    const calls = vi.mocked(apiClient.request).mock.calls.map(([arg]) => arg);
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          method: "post",
          url: "/job-applications/admin/42/approve",
          data: {},
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      ])
    );
  });

  it("should continue approve fallback attempts after 409", async () => {
    vi.mocked(apiClient.request)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 409 },
      })
      .mockResolvedValueOnce({ data: {} });

    await service.approve(42, jwtToken);

    expect(vi.mocked(apiClient.request)).toHaveBeenCalledTimes(2);
    expect(apiClient.request).toHaveBeenNthCalledWith(1, {
      method: "post",
      url: "/job-applications/admin/42/approve",
      data: {},
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    expect(apiClient.request).toHaveBeenNthCalledWith(2, {
      method: "post",
      url: "/job-applications/admin/42/approve",
      data: { status: "approved" },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  });

  it("should call reject endpoint with admin-scoped path first", async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({ data: {} });

    await service.reject(42, jwtToken);

    expect(apiClient.request).toHaveBeenNthCalledWith(1, {
      method: "post",
      url: "/job-applications/admin/42/reject",
      data: {},
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  });

  it("should fallback reject endpoint to non-admin path when admin path returns 404", async () => {
    vi.mocked(apiClient.request)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockResolvedValueOnce({ data: {} });

    await service.reject(42, jwtToken);

    const calls = vi.mocked(apiClient.request).mock.calls.map(([arg]) => arg);
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          method: "post",
          url: "/job-applications/admin/42/reject",
          data: {},
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      ])
    );
  });

  it("should fallback reject to legacy path after two 404s", async () => {
    vi.mocked(apiClient.request)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockResolvedValueOnce({ data: {} });

    await service.reject(42, jwtToken);

    const calls = vi.mocked(apiClient.request).mock.calls.map(([arg]) => arg);
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          method: "post",
          url: "/job-applications/admin/42/reject",
          data: {},
          headers: { Authorization: `Bearer ${jwtToken}` },
        },
      ])
    );
  });

  it("should continue reject fallback attempts after 409", async () => {
    vi.mocked(apiClient.request)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 409 },
      })
      .mockResolvedValueOnce({ data: {} });

    await service.reject(42, jwtToken);

    expect(vi.mocked(apiClient.request)).toHaveBeenCalledTimes(2);
    expect(apiClient.request).toHaveBeenNthCalledWith(1, {
      method: "post",
      url: "/job-applications/admin/42/reject",
      data: {},
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    expect(apiClient.request).toHaveBeenNthCalledWith(2, {
      method: "post",
      url: "/job-applications/admin/42/reject",
      data: { status: "rejected" },
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
  });
});
