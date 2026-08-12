import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../src/controllers/authController";
import * as authApiService from "../../src/services/authApiService";

vi.mock("../../src/services/authApiService", () => ({
  login: vi.fn(),
	register: vi.fn(),
}));

type TestSession = {
  jwtToken?: string;
  userRole?: "ADMIN" | "USER";
  destroy: (callback: () => void) => void;
};

type MockRequest = Request & {
  body: Record<string, unknown>;
  session: TestSession;
};

function createReq(partial: Partial<MockRequest> = {}): MockRequest {
  return {
    body: {},
    session: {
      jwtToken: undefined,
      destroy: vi.fn((callback: () => void) => callback()),
    },
    ...partial,
  } as MockRequest;
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

function createTokenWithRole(role: "ADMIN" | "USER"): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role })).toString("base64url");
  return `${header}.${payload}.signature`;
}

describe("AuthController", () => {
  const controller = new AuthController();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to home when showing login for authenticated user", () => {
    const req = createReq({
      session: {
        jwtToken: "existing-token",
        destroy: vi.fn((callback: () => void) => callback()),
      },
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
      successMessage: undefined,
    });
  });

  it("should render login page with success message when coming from registration", () => {
    const req = createReq({
      query: { registered: "1" },
    } as Partial<MockRequest>);
    const res = createRes();

    controller.showLogin(req, res);

    expect(res.render).toHaveBeenCalledWith("pages/login.njk", {
      formValues: { email: "" },
      successMessage: "Account created. Please sign in.",
    });
  });

  it("should render register page for unauthenticated user", () => {
    const req = createReq();
    const res = createRes();

    controller.showRegister(req, res);

    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      formValues: { email: "" },
    });
  });

  it("should redirect authenticated users away from register page", () => {
    const req = createReq({
      session: {
        jwtToken: "existing-token",
        destroy: vi.fn((callback: () => void) => callback()),
      },
    });
    const res = createRes();

    controller.showRegister(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/");
  });

  it("should render register confirmation page for unauthenticated user", () => {
    const req = createReq();
    const res = createRes();

    controller.showRegisterConfirmation(req, res);

    expect(res.render).toHaveBeenCalledWith("pages/registerConfirmation.njk");
  });

  it("should redirect authenticated users away from register confirmation page", () => {
    const req = createReq({
      session: {
        jwtToken: "existing-token",
        destroy: vi.fn((callback: () => void) => callback()),
      },
    });
    const res = createRes();

    controller.showRegisterConfirmation(req, res);

    expect(res.redirect).toHaveBeenCalledWith("/");
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
    vi.mocked(authApiService.login).mockResolvedValueOnce(
      createTokenWithRole("USER"),
    );

    const req = createReq({
      body: { email: "jane.doe", password: "password123" },
    });
    const res = createRes();

    await controller.login(req, res);

    expect(authApiService.login).toHaveBeenCalledWith("jane.doe", "password123");
    expect(req.session.jwtToken).toBe(createTokenWithRole("USER"));
    expect(req.session.userRole).toBe("USER");
    expect(res.redirect).toHaveBeenCalledWith("/");
  });

  it("should return 401 when backend token does not include a valid role", async () => {
    vi.mocked(authApiService.login).mockResolvedValueOnce("invalid-token");

    const req = createReq({
      body: { email: "jane.doe", password: "password123" },
    });
    const res = createRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.render).toHaveBeenCalledWith("pages/login.njk", {
      errorMessage: "Invalid login token",
      formValues: { email: "jane.doe" },
    });
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

  it("should validate register input", async () => {
    const req = createReq({
      body: { email: "", password: "", confirmPassword: "" },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Enter email, password and confirm password",
      formValues: { email: "" },
    });
  });

  it("should validate confirm password mismatch", async () => {
    const req = createReq({
      body: {
        email: "new.user",
        password: "password123",
        confirmPassword: "password456",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(authApiService.register).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Passwords do not match",
      formValues: { email: "new.user" },
    });
  });

  it("should validate weak registration password", async () => {
    const req = createReq({
      body: {
        email: "new.user",
        password: "password123",
        confirmPassword: "password123",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(authApiService.register).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Password must be more than 8 characters and include upper, lower and special characters",
      formValues: { email: "new.user" },
    });
  });

  it("should validate password with no uppercase", async () => {
    const req = createReq({
      body: {
        email: "new.user",
        password: "password123!",
        confirmPassword: "password123!",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(authApiService.register).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Password must be more than 8 characters and include upper, lower and special characters",
      formValues: { email: "new.user" },
    });
  });

  it("should validate password with no lowercase", async () => {
    const req = createReq({
      body: {
        email: "new.user",
        password: "PASSWORD123!",
        confirmPassword: "PASSWORD123!",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(authApiService.register).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Password must be more than 8 characters and include upper, lower and special characters",
      formValues: { email: "new.user" },
    });
  });

  it("should validate password with no special characters", async () => {
    const req = createReq({
      body: {
        email: "new.user",
        password: "Password123",
        confirmPassword: "Password123",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(authApiService.register).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Password must be more than 8 characters and include upper, lower and special characters",
      formValues: { email: "new.user" },
    });
  });

  it("should validate password that is too short", async () => {
    const req = createReq({
      body: {
        email: "new.user",
        password: "Pass1!",
        confirmPassword: "Pass1!",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(authApiService.register).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Password must be more than 8 characters and include upper, lower and special characters",
      formValues: { email: "new.user" },
    });
  });

  it("should handle non-Error exceptions during login", async () => {
    vi.mocked(authApiService.login).mockRejectedValueOnce("Some string error");

    const req = createReq({
      body: { email: "jane.doe", password: "password123" },
    });
    const res = createRes();

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.render).toHaveBeenCalledWith("pages/login.njk", {
      errorMessage: "Unable to sign in",
      formValues: { email: "jane.doe" },
    });
  });

  it("should handle non-Error exceptions during register", async () => {
    vi.mocked(authApiService.register).mockRejectedValueOnce("Some string error");

    const req = createReq({
      body: {
        email: "new.user",
        password: "Password123!",
        confirmPassword: "Password123!",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Unable to register",
      formValues: { email: "new.user" },
    });
  });

  it("should redirect to login after successful registration", async () => {
    vi.mocked(authApiService.register).mockResolvedValueOnce(undefined);

    const req = createReq({
      body: {
        email: "new.user",
        password: "Password123!",
        confirmPassword: "Password123!",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(authApiService.register).toHaveBeenCalledWith("new.user", "Password123!");
    expect(res.redirect).toHaveBeenCalledWith("/register/confirmation");
  });

  it("should render register page with error when registration fails", async () => {
    vi.mocked(authApiService.register).mockRejectedValueOnce(
      new Error("Email already in use"),
    );

    const req = createReq({
      body: {
        email: "existing.user",
        password: "Password123!",
        confirmPassword: "Password123!",
      },
    });
    const res = createRes();

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.render).toHaveBeenCalledWith("pages/register.njk", {
      errorMessage: "Email already in use",
      formValues: { email: "existing.user" },
    });
  });

  it("should destroy session, clear cookie, and redirect on logout", () => {
    const destroy = vi.fn((callback: () => void) => callback());
    const req = createReq({
      session: { jwtToken: "jwt-token", destroy },
    });
    const res = createRes();

    controller.logout(req, res);

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(res.clearCookie).toHaveBeenCalledWith("connect.sid");
    expect(res.redirect).toHaveBeenCalledWith("/login");
  });
});
