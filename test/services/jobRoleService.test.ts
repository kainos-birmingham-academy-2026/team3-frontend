import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient";
import { JobRoleService } from "../../src/services/jobRoleService";

vi.mock("../../src/config/apiClient", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("JobRoleService", () => {
  const service = new JobRoleService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should convert closingDate from datetime to date-only", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        {
          jobRoleId: 1,
          roleName: "Software Engineer",
          locationName: "Birmingham",
          capabilityName: "Software Engineering",
          bandName: "Engineer",
          closingDate: "2026-08-06T00:00:00.000Z",
          status: "OPEN",
        },
      ],
    });

    const result = await service.getAll();

    expect(apiClient.get).toHaveBeenCalledWith("/job-roles");
    expect(result[0]?.closingDate).toBe("2026-08-06");
    expect(result[0]?.status).toBe("open");
    expect(result[0]?.capability).toBe("Software Engineering");
  });

  it("should keeps role status values from backend for view filtering", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        {
          jobRoleId: 1,
          roleName: "Software Engineer",
          locationName: "Birmingham",
          capabilityName: "Software Engineering",
          bandName: "Engineer",
          closingDate: "2026-08-06T00:00:00.000Z",
          status: "OPEN",
        },
        {
          jobRoleId: 2,
          roleName: "Delivery Manager",
          locationName: "Leeds",
          capabilityName: "Delivery Management",
          bandName: "Senior Engineer",
          closingDate: "2026-09-01T00:00:00.000Z",
          status: "CLOSED",
        },
      ],
    });

    const result = await service.getAll();

    expect(result[0]?.status).toBe("open");
    expect(result[1]?.status).toBe("closed");
  });

  it("should throw a friendly message when backend returns 404", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });

    await expect(service.getAll()).rejects.toThrow("No job roles found");
  });

  it("should throw a friendly message when backend returns 500", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500 },
    });

    await expect(service.getAll()).rejects.toThrow("Backend server error");
  });
});
