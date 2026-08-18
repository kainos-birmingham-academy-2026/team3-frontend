import { test as base } from "@playwright/test";
import { HomePage } from "../pages/homePage";

type HomeFixtures = {
	homePage: HomePage;
};

export const homeFixtures = base.extend<HomeFixtures>({
	homePage: async ({ page }, use) => {
		await use(new HomePage(page));
	},
});
