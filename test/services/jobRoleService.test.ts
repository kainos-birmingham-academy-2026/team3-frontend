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

  it("should read statusName when status is not present", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        {
          jobRoleId: 1,
          roleName: "Software Engineer",
          locationName: "Birmingham",
          capabilityName: "Software Engineering",
          bandName: "Engineer",
          closingDate: "2026-08-06T00:00:00.000Z",
          statusName: "OPEN",
        },
      ],
    });

    const result = await service.getAll();

    expect(result[0]?.status).toBe("open");
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

  it("should map sharepointUrl to jobSpecUrl for getAll", async () => {
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
          sharepointUrl: "https://sharepoint.com/jobs/engineer",
        },
      ],
    });

    const result = await service.getAll();

    expect(result[0]?.jobSpecUrl).toBe("https://sharepoint.com/jobs/engineer");
  });

  it("should map numberOfOpenPositions to openPositions", async () => {
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
          numberOfOpenPositions: 3,
        },
      ],
    });

    const result = await service.getAll();

    expect(result[0]?.openPositions).toBe(3);
  });

  it("should include responsibilities in response", async () => {
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
          responsibilities: "Build and maintain software systems",
        },
      ],
    });

    const result = await service.getAll();

    expect(result[0]?.responsibilities).toBe("Build and maintain software systems");
  });

  it("should map address fields for getAll", async () => {
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
          addressLine1: "123 Business Street",
          addressLine2: "Suite 100",
          postcode: "B1 1AA",
        },
      ],
    });

    const result = await service.getAll();

    expect(result[0]?.addressLine1).toBe("123 Business Street");
    expect(result[0]?.addressLine2).toBe("Suite 100");
    expect(result[0]?.postcode).toBe("B1 1AA");
  });

  it("should retrieve job role by ID with all detailed fields", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        jobRoleId: 1,
        roleName: "Software Engineer",
        locationName: "Birmingham",
        capabilityName: "Software Engineering",
        bandName: "Engineer",
        closingDate: "2026-08-06T00:00:00.000Z",
        statusName: "OPEN",
        description: "We are looking for a talented Software Engineer",
        responsibilities: "Build and maintain software systems",
        sharepointUrl: "https://sharepoint.com/jobs/engineer",
        numberOfOpenPositions: 2,
        addressLine1: "123 Business Street",
        addressLine2: "Suite 100",
        postcode: "B1 1AA",
      },
    });

    const result = await service.getById("1");

    expect(apiClient.get).toHaveBeenCalledWith("/job-roles/1");
    expect(result?.jobRoleId).toBe(1);
    expect(result?.description).toBe("We are looking for a talented Software Engineer");
    expect(result?.responsibilities).toBe("Build and maintain software systems");
    expect(result?.jobSpecUrl).toBe("https://sharepoint.com/jobs/engineer");
    expect(result?.openPositions).toBe(2);
    expect(result?.addressLine1).toBe("123 Business Street");
  });

  it("should handle missing optional fields in getById", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        jobRoleId: 1,
        roleName: "Software Engineer",
        locationName: "Birmingham",
        capabilityName: "Software Engineering",
        bandName: "Engineer",
        closingDate: "2026-08-06T00:00:00.000Z",
        statusName: "OPEN",
      },
    });

    const result = await service.getById("1");

    expect(result?.description).toBeUndefined();
    expect(result?.responsibilities).toBeUndefined();
    expect(result?.jobSpecUrl).toBeUndefined();
    expect(result?.openPositions).toBeUndefined();
    expect(result?.addressLine1).toBeUndefined();
  });

  it("should send authorization header when token is provided", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        {
          jobRoleId: 9,
          roleName: "Platform Engineer",
          closingDate: "2026-10-01T00:00:00.000Z",
        },
      ],
    });

    await service.getAll("jwt-token");

    expect(apiClient.get).toHaveBeenCalledWith("/job-roles", {
      headers: { Authorization: "Bearer jwt-token" },
    });
  });

  it("should use fallback values for missing location, capability, and band", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: [
        {
          jobRoleId: 10,
          roleName: "Data Engineer",
          closingDate: "2026-11-12T00:00:00.000Z",
        },
      ],
    });

    const result = await service.getAll();

    expect(result[0]?.location).toBe("Unknown");
    expect(result[0]?.capability).toBe("Unknown");
    expect(result[0]?.band).toBe("Unknown");
    expect(result[0]?.status).toBe("unknown");
  });

  it("should map id-based capability, band, openPositions and jobSpecUrl fallback", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        jobRoleId: 11,
        roleName: "Delivery Lead",
        closingDate: "2026-12-20T00:00:00.000Z",
        capabilityId: 44,
        bandId: 7,
        status: "OPEN",
        jobSpecUrl: "https://example.com/spec",
        openPositions: 5,
      },
    });

    const result = await service.getById("11");

    expect(result.capability).toBe("44");
    expect(result.band).toBe("7");
    expect(result.jobSpecUrl).toBe("https://example.com/spec");
    expect(result.openPositions).toBe(5);
  });

  it("should throw a friendly message when getById returns 404", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });

    await expect(service.getById("999")).rejects.toThrow("Job role with ID 999 not found");
  });

  it("should throw a friendly message when getById returns 500", async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500 },
    });

    await expect(service.getById("123")).rejects.toThrow("Backend server error");
  });
});
