import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../src/controllers/authController";
import * as authApiService from "../../src/services/authApiService";

vi.mock("../../src/services/authApiService", () => ({
  login: vi.fn(),
}));

function createReq(partial: Partial<Request> = {}): Request {
  return {
    body: {},
    session: {
      jwtToken: undefined,
      destroy: vi.fn((callback: () => void) => callback()),
    },
    ...partial,
  } as unknown as Request;
}

function createRes(): Response {
  const res = {
    redirect: vi.fn(),
    render: vi.fn(),
    status: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  return res;
}

describe("AuthController", () => {
  const controller = new AuthController();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to home when showing login for authenticated user", () => {
    const req = createReq({
      session: { jwtToken: "existing-token" } as Request["session"],
    });
    const res = createRes();

    controller.showLogin(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/");
  });

  it("should render login page for unauthenticated user", () => {
    const req = createReq();
    const res = createRes();

    controller.showLogin(req, res);

    expect(res.render).toHaveBeenCalledWith("pages/login.njk", {
      formValues: { email: "" },
    });
  });

  it("should return validation error when email is missing", async () => {
    const req = createReq({
      body: { email: "   ", password: "password123" },
    });
    const res = createRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/login.njk", {
      errorMessage: "Enter both email and password",
      formValues: { email: "" },
    });
  });

  it("should return validation error when password is missing", async () => {
    const req = createReq({
      body: { email: "jane.doe", password: "   " },
    });
    const res = createRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/login.njk", {
      errorMessage: "Enter both email and password",
      formValues: { email: "jane.doe" },
    });
  });

  it("should store token and redirect to home on successful login", async () => {
    vi.mocked(authApiService.login).mockResolvedValueOnce("jwt-token");

    const req = createReq({
      body: { email: "jane.doe", password: "password123" },
    });
    const res = createRes();

    await controller.login(req, res);

    expect(authApiService.login).toHaveBeenCalledWith("jane.doe", "password123");
    expect(req.session.jwtToken).toBe("jwt-token");
    expect(res.redirect).toHaveBeenCalledWith("/");
  });

  it("should render 401 with error message when login fails", async () => {
    vi.mocked(authApiService.login).mockRejectedValueOnce(
      new Error("Invalid email or password"),
    );

    const req = createReq({
      body: { email: "jane.doe", password: "password123" },
    });
    const res = createRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.render).toHaveBeenCalledWith("pages/login.njk", {
      errorMessage: "Invalid email or password",
      formValues: { email: "jane.doe" },
    });
  });

  it("should destroy session, clear cookie, and redirect on logout", () => {
    const destroy = vi.fn((callback: () => void) => callback());
    const req = createReq({
      session: { jwtToken: "jwt-token", destroy } as Request["session"],
    });
    const res = createRes();

    controller.logout(req, res);

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(res.clearCookie).toHaveBeenCalledWith("connect.sid");
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });
});
