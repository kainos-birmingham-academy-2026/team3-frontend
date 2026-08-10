import axios from "axios";
import apiClient from "../config/apiClient.js";

type LoginResponse = {
	token?: string;
	jwtToken?: string;
	accessToken?: string;
};

function extractToken(data: LoginResponse): string | null {
	return data.token ?? data.jwtToken ?? data.accessToken ?? null;
}

export async function login(username: string, password: string): Promise<string> {
	const loginPath = process.env.AUTH_LOGIN_PATH ?? "/api/login";

	try {
		const response = await apiClient.post<LoginResponse>(loginPath, {
			email: username,
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
			if (status === 400 || status === 401) {
				throw new Error("Invalid username or password");
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
