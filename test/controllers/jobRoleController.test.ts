import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRoleController } from "../../src/controllers/jobRoleController";

function createReq(partial: Partial<Request> = {}): Request {
  return {
    session: {
      jwtToken: undefined,
    },
    ...partial,
  } as unknown as Request;
}

function createRes(): Response {
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
  };

  const controller = new JobRoleController(jobRoleService);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call service with JWT token and render job roles", async () => {
    const req = createReq({
      session: { jwtToken: "jwt-token" } as Request["session"],
    });
    const res = createRes();
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

    await controller.getAll(req, res);

    expect(jobRoleService.getAll).toHaveBeenCalledWith("jwt-token");
    expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", { jobRoles });
  });

  it("should clear token and redirect to login when backend returns 401", async () => {
    const req = createReq({
      session: { jwtToken: "jwt-token" } as Request["session"],
    });
    const res = createRes();

    jobRoleService.getAll.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401 },
    });

    await controller.getAll(req, res);

    expect(req.session.jwtToken).toBeUndefined();
    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(res.render).not.toHaveBeenCalled();
  });

  it("should render 500 with empty list and message when API call fails", async () => {
    const req = createReq();
    const res = createRes();

    jobRoleService.getAll.mockRejectedValueOnce(new Error("Backend server error"));

    await controller.getAll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.render).toHaveBeenCalledWith("pages/jobRoleList.njk", {
      jobRoles: [],
      errorMessage: "Backend server error",
    });
  });
});
