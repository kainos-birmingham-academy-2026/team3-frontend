import { beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "../../src/config/apiClient.js";
import { login } from "../../src/services/authApiService";

vi.mock("../../src/config/apiClient.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("authApiService", () => {
  const originalAuthLoginPath = process.env.AUTH_LOGIN_PATH;

  beforeEach(() => {
    vi.clearAllMocks();
    if (originalAuthLoginPath === undefined) {
      delete process.env.AUTH_LOGIN_PATH;
      return;
    }

    process.env.AUTH_LOGIN_PATH = originalAuthLoginPath;
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
});
