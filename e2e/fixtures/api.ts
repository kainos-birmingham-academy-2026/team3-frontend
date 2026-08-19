import { test as base } from "@playwright/test";
import { AuthApi } from "../api/authApi";

type ApiFixtures = {
	authApi: AuthApi;
};

export const apiFixtures = base.extend<ApiFixtures>({
	authApi: async ({ request }, use) => {
		await use(new AuthApi(request));
	},
});
