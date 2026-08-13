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
          status: "denied",
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

  it("should continue on 404 and succeed on fallback cv endpoint", async () => {
    vi.mocked(apiClient.get)
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 404 },
      })
      .mockResolvedValueOnce({
        data: {
          application: {
            cvReference: "Fallback CV",
          },
        },
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
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({ data: { foo: "bar" } })
      .mockResolvedValueOnce({
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

  it("should throw conflict error when all update attempts return 409", async () => {
    const conflictError = {
      isAxiosError: true,
      response: { status: 409 },
      message: "conflict",
    };
    vi.mocked(apiClient.request).mockImplementation(() => Promise.reject(conflictError));

    await expect(service.approve(42, jwtToken)).rejects.toBe(conflictError);
  });

  it("should throw method error when all update attempts return 405", async () => {
    const methodError = {
      isAxiosError: true,
      response: { status: 405 },
      message: "method not allowed",
    };
    vi.mocked(apiClient.request).mockImplementation(() => Promise.reject(methodError));

    await expect(service.approve(42, jwtToken)).rejects.toBe(methodError);
  });

  it("should throw bad request error when all update attempts return 400", async () => {
    const badRequestError = {
      isAxiosError: true,
      response: { status: 400 },
      message: "bad request",
    };
    vi.mocked(apiClient.request).mockImplementation(() => Promise.reject(badRequestError));

    await expect(service.reject(42, jwtToken)).rejects.toBe(badRequestError);
  });

  it("should throw endpoint discovery error when all update attempts return 404", async () => {
    const notFoundError = {
      isAxiosError: true,
      response: { status: 404 },
      message: "not found",
    };
    vi.mocked(apiClient.request).mockImplementation(() => Promise.reject(notFoundError));

    await expect(service.reject(42, jwtToken)).rejects.toThrow(
      "No matching status update endpoint found. Tried:"
    );
  });
});
