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
		} else {
			process.env.AUTH_LOGIN_PATH = originalAuthLoginPath;
		}

		if (originalAuthRegisterPath === undefined) {
			delete process.env.AUTH_REGISTER_PATH;
		} else {
			process.env.AUTH_REGISTER_PATH = originalAuthRegisterPath;
		}
	});

	it("should send login payload with email mapping and return token", async () => {
		vi.mocked(apiClient.post).mockResolvedValueOnce({
			data: { token: "jwt-token" },
		});

		const result = await login("jane.doe@example.com", "password123");

		expect(result).toBe("jwt-token");
		expect(apiClient.post).toHaveBeenCalledWith("/api/auth/login", {
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

		const accessTokenResult = await login(
			"jane.doe@example.com",
			"password123",
		);
		expect(accessTokenResult).toBe("jwt-token-3");
	});

	it("should throw when authentication returns no token", async () => {
		vi.mocked(apiClient.post).mockResolvedValueOnce({
			data: {},
		});

		await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
			"Sign-in could not be completed. Please try again.",
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
			"We cannot sign you in right now. Please try again in a moment.",
		);

		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 500 },
		});

		await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
			"We cannot sign you in right now. Please try again in a moment.",
		);
	});

	it("should map backend connection failures to a user friendly message", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			code: "ECONNREFUSED",
			response: undefined,
		});

		await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
			"We cannot sign you in right now. Please try again in a moment.",
		);
	});

	it("should send register payload", async () => {
		vi.mocked(apiClient.post).mockResolvedValueOnce({
			data: { message: "User registered" },
		});

		await expect(
			register("new.user@example.com", "password123"),
		).resolves.toBeUndefined();

		expect(apiClient.post).toHaveBeenCalledWith("/api/auth/register", {
			email: "new.user@example.com",
			password: "password123",
		});
	});

	it("should use AUTH_REGISTER_PATH when provided", async () => {
		process.env.AUTH_REGISTER_PATH = "/auth/register";
		vi.mocked(apiClient.post).mockResolvedValueOnce({
			data: { message: "User registered" },
		});

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

		await expect(
			register("existing@example.com", "password123"),
		).rejects.toThrow("Email already in use");

		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 500 },
		});

		await expect(
			register("existing@example.com", "password123"),
		).rejects.toThrow(
			"We cannot create your account right now. Please try again in a moment.",
		);
	});

	it("should map 400 error for registration", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 400 },
		});

		await expect(
			register("invalid@example.com", "password123"),
		).rejects.toThrow("Please enter a valid email and password");
	});

	it("should map 404 error for registration endpoint", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			response: { status: 404 },
		});

		await expect(register("new@example.com", "password123")).rejects.toThrow(
			"We cannot create your account right now. Please try again in a moment.",
		);
	});

	it("should map backend connection failures for registration", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			code: "ECONNREFUSED",
			response: undefined,
		});

		await expect(register("new@example.com", "password123")).rejects.toThrow(
			"We cannot create your account right now. Please try again in a moment.",
		);
	});

	it("should map non-axios errors for login", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce(
			new Error("Unexpected error"),
		);

		await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
			"Unexpected error",
		);
	});

	it("should map non-axios errors for register", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce(
			new Error("Unexpected error"),
		);

		await expect(register("new@example.com", "password123")).rejects.toThrow(
			"Unexpected error",
		);
	});

	it("should map ENOTFOUND network error for login", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			code: "ENOTFOUND",
			response: undefined,
		});

		await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
			"We cannot sign you in right now. Please try again in a moment.",
		);
	});

	it("should map ECONNABORTED network error for login", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			code: "ECONNABORTED",
			response: undefined,
		});

		await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
			"We cannot sign you in right now. Please try again in a moment.",
		);
	});

	it("should map ETIMEDOUT network error for login", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			code: "ETIMEDOUT",
			response: undefined,
		});

		await expect(login("jane.doe@example.com", "password123")).rejects.toThrow(
			"We cannot sign you in right now. Please try again in a moment.",
		);
	});

	it("should map ENOTFOUND network error for registration", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			code: "ENOTFOUND",
			response: undefined,
		});

		await expect(register("new@example.com", "password123")).rejects.toThrow(
			"We cannot create your account right now. Please try again in a moment.",
		);
	});

	it("should map ECONNABORTED network error for registration", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			code: "ECONNABORTED",
			response: undefined,
		});

		await expect(register("new@example.com", "password123")).rejects.toThrow(
			"We cannot create your account right now. Please try again in a moment.",
		);
	});

	it("should map ETIMEDOUT network error for registration", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			code: "ETIMEDOUT",
			response: undefined,
		});

		await expect(register("new@example.com", "password123")).rejects.toThrow(
			"We cannot create your account right now. Please try again in a moment.",
		);
	});

	it("should handle error without status and code in login", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			response: undefined,
			code: undefined,
		});

		await expect(
			login("jane.doe@example.com", "password123"),
		).rejects.toThrow();
	});

	it("should handle error without status and code in register", async () => {
		vi.mocked(apiClient.post).mockRejectedValueOnce({
			isAxiosError: true,
			response: undefined,
			code: undefined,
		});

		await expect(register("new@example.com", "password123")).rejects.toThrow();
	});
});
