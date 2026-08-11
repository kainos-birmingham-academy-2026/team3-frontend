import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient.js";
import { login, register } from "../../src/services/authApiService";

vi.mock("../../src/config/apiClient.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("authApiService", () => {
  const originalAuthLoginPath = process.env.AUTH_LOGIN_PATH;
  const originalAuthRegisterPath = process.env.AUTH_REGISTER_PATH;

  beforeEach(() => {
    vi.clearAllMocks();
    if (originalAuthLoginPath === undefined) {
      delete process.env.AUTH_LOGIN_PATH;
      return;
    }

    process.env.AUTH_LOGIN_PATH = originalAuthLoginPath;

    if (originalAuthRegisterPath === undefined) {
      delete process.env.AUTH_REGISTER_PATH;
      return;
    }

    process.env.AUTH_REGISTER_PATH = originalAuthRegisterPath;
  });

  it("should send login payload with email mapping and return token", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { token: "jwt-token" },
    });

    const result = await login("jane.doe@example.com", "password123");

    expect(result).toBe("jwt-token");
    expect(apiClient.post).toHaveBeenCalledWith("/api/login", {
      email: "jane.doe@example.com",
      password: "password123",
    });
  });

  it("should use AUTH_LOGIN_PATH when provided", async () => {
    process.env.AUTH_LOGIN_PATH = "/auth/sign-in";
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { token: "jwt-token" },
    });

    await login("jane.doe@example.com", "password123");

    expect(apiClient.post).toHaveBeenCalledWith("/auth/sign-in", {
      email: "jane.doe@example.com",
      password: "password123",
    });
  });

  it("should accept jwtToken and accessToken response keys", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { jwtToken: "jwt-token-2" },
    });

    const jwtTokenResult = await login("jane.doe@example.com", "password123");
    expect(jwtTokenResult).toBe("jwt-token-2");

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { accessToken: "jwt-token-3" },
    });

    const accessTokenResult = await login("jane.doe@example.com", "password123");
    expect(accessTokenResult).toBe("jwt-token-3");
  });

  it("should throw when authentication returns no token", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {},
    });

    await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
      "Authentication succeeded but no JWT token was returned",
    );
  });

  it("should map 400 and 401 to invalid credentials message", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400 },
    });

    await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
      "Invalid email or password",
    );

    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 401 },
    });

    await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
      "Invalid email or password",
    );
  });

  it("should map 404 and 500 backend errors", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });

    await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
      "Login endpoint not found",
    );

    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500 },
    });

    await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
      "Backend server error during login",
    );
  });

  it("should map backend connection failures to a user friendly message", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      code: "ECONNREFUSED",
      response: undefined,
    });

    await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
      "Something went wrong, please try again later.",
    );
  });

  it("should send register payload", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { message: "User registered" } });

    await expect(register("new.user@example.com", "password123")).resolves.toBeUndefined();

    expect(apiClient.post).toHaveBeenCalledWith("/api/register", {
      email: "new.user@example.com",
      password: "password123",
    });
  });

  it("should use AUTH_REGISTER_PATH when provided", async () => {
    process.env.AUTH_REGISTER_PATH = "/auth/register";
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { message: "User registered" } });

    await register("new.user@example.com", "password123");

    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", {
      email: "new.user@example.com",
      password: "password123",
    });
  });

  it("should map registration backend errors", async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 409 },
    });

    await expect(register("existing@example.com", "password123")).rejects.toThrow(
      "Email already in use",
    );

    vi.mocked(apiClient.post).mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 500 },
    });

    await expect(register("existing@example.com", "password123")).rejects.toThrow(
      "Backend server error during registration",
    );
  });
});
