import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";

type TestRequest = {
  session: {
    jwtToken?: string;
  };
  params?: {
    id?: string | string[];
  };
};

function createRequest(partial: Partial<TestRequest> = {}): TestRequest {
  return {
    session: {
      jwtToken: undefined,
    },
    ...partial,
  };
}

function createResponse(): Response {
  const res = {
    redirect: vi.fn(),
    render: vi.fn(),
    status: vi.fn(),
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  return res;
}

describe("JobRoleController", () => {
  const jobRoleService = {
    getAll: vi.fn(),
    getById: vi.fn(),
  };

  const controller = new JobRoleController(jobRoleService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call service with JWT token and render job roles", async () => {
    const req = createRequest({
      session: { jwtToken: "jwt-token" },
    });
    const res = createResponse();
    const jobRoles = [
      {
        jobRoleId: 1,
        roleName: "Software Engineer",
        location: "Birmingham",
        capabilityId: 1,
        bandId: 5,
        closingDate: "2026-08-06",
        status: "open",
      },
    ];

    jobRoleService.getAll.mockResolvedValueOnce(jobRoles);

    await controller.getAll(req as unknown as Request, res);

    expect(jobRoleService.getAll).toHaveBeenCalledWith("jwt-token");
    expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", { jobRoles });
  });

  it("should clear token and redirect to login when backend returns 401", async () => {
    const req = createRequest({
      session: { jwtToken: "jwt-token" },
    });
    const res = createResponse();

    jobRoleService.getAll.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401 },
    });

    await controller.getAll(req as unknown as Request, res);

    expect(req.session.jwtToken).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(res.render).not.toHaveBeenCalled();
  });

  it("should render 500 with empty list and message when API call fails", async () => {
    const req = createRequest();
    const res = createResponse();

    jobRoleService.getAll.mockRejectedValueOnce(new Error("Backend server error"));

    await controller.getAll(req as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
      jobRoles: [],
      errorMessage: "Backend server error",
    });
  });

  it("should render detail page for getById success", async () => {
    const req = createRequest({
      session: { jwtToken: "jwt-token" },
      params: { id: "7" },
    });
    const res = createResponse();
    const jobRole = {
      jobRoleId: 7,
      roleName: "QA Engineer",
    };

    jobRoleService.getById.mockResolvedValueOnce(jobRole);

    await controller.getById(req as unknown as Request, res);

    expect(jobRoleService.getById).toHaveBeenCalledWith("7", "jwt-token");
    expect(res.render).toHaveBeenCalledWith("pages/jobRoleDetail.njk", { jobRoleId: jobRole });
  });

  it("should use the first id when params.id is an array", async () => {
    const req = createRequest({
      session: { jwtToken: "jwt-token" },
      params: { id: ["12", "13"] },
    });
    const res = createResponse();

    jobRoleService.getById.mockResolvedValueOnce({ jobRoleId: 12, roleName: "Analyst" });

    await controller.getById(req as unknown as Request, res);

    expect(jobRoleService.getById).toHaveBeenCalledWith("12", "jwt-token");
  });

  it("should clear token and redirect to login when getById returns 401", async () => {
    const req = createRequest({
      session: { jwtToken: "jwt-token" },
      params: { id: "1" },
    });
    const res = createResponse();

    jobRoleService.getById.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401 },
    });

    await controller.getById(req as unknown as Request, res);

    expect(req.session.jwtToken).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(res.render).not.toHaveBeenCalled();
  });

  it("should render default message when non-Error is thrown", async () => {
    const req = createRequest({
      params: { id: "1" },
    });
    const res = createResponse();

    jobRoleService.getById.mockRejectedValueOnce("unknown failure");

    await controller.getById(req as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
      jobRoles: [],
      errorMessage: "Unable to load job roles",
    });
  });
});
