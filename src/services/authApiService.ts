import axios from "axios";
import apiClient from "../config/apiClient.js";

type LoginResponse = {
	token?: string;
	jwtToken?: string;
	accessToken?: string;
};

type RegisterResponse = {
	message?: string;
};

function extractToken(data: LoginResponse): string | null {
	return data.token ?? data.jwtToken ?? data.accessToken ?? null;
}

export async function login(email: string, password: string): Promise<string> {
	const loginPath = process.env.AUTH_LOGIN_PATH ?? "/api/login";

	try {
		const response = await apiClient.post<LoginResponse>(loginPath, {
			email,
			password,
		});

		const token = extractToken(response.data);
		if (!token) {
			throw new Error("Authentication succeeded but no JWT token was returned");
		}

		return token;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const networkErrorCodes = new Set(["ECONNREFUSED", "ENOTFOUND", "ECONNABORTED", "ETIMEDOUT"]);

			if (!status && error.code && networkErrorCodes.has(error.code)) {
				throw new Error("Something went wrong, please try again later.");
			}

			if (status === 400 || status === 401) {
				throw new Error("Invalid email or password");
			}
			if (status === 404) {
				throw new Error("Login endpoint not found");
			}
			if (status === 500) {
				throw new Error("Backend server error during login");
			}
		}

		throw error;
	}
}

export async function register(email: string, password: string): Promise<void> {
	const registerPath = process.env.AUTH_REGISTER_PATH ?? "/api/register";

	try {
		await apiClient.post<RegisterResponse>(registerPath, {
			email,
			password,
		});
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const status = error.response?.status;
			const networkErrorCodes = new Set(["ECONNREFUSED", "ENOTFOUND", "ECONNABORTED", "ETIMEDOUT"]);

			if (!status && error.code && networkErrorCodes.has(error.code)) {
				throw new Error("Something went wrong, please try again later.");
			}

			if (status === 400) {
				throw new Error("Please enter a valid email and password");
			}

			if (status === 409) {
				throw new Error("Email already in use");
			}

			if (status === 404) {
				throw new Error("Registration endpoint not found");
			}

			if (status === 500) {
				throw new Error("Backend server error during registration");
			}
		}

		throw error;
	}
}
