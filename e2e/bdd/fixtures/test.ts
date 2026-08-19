import { mergeTests } from "@playwright/test";
import { test as bddTest } from "playwright-bdd";
import { test as projectTest } from "../../fixtures/test";
import { deleteUserByEmail } from "../../support/db";
import { createTestUser, type TestUser } from "../../support/testUser";
import {
	createAdminHireWorld,
	type AdminHireWorld,
} from "../world/adminHireWorld";

type BddFixtures = {
	user: TestUser;
	adminHireWorld: AdminHireWorld;
};

export const test = mergeTests(bddTest, projectTest).extend<BddFixtures>({
	user: async ({ page: _page }, use) => {
		const user = createTestUser();
		await use(user);
		await deleteUserByEmail(user.email);
	},
	adminHireWorld: async ({ page: _page }, use) => {
		await use(createAdminHireWorld());
	},
});
