import { test as base } from "@playwright/test";
import { JobRoleListPage } from "../pages/jobRoleListPage";

type JobRoleFixtures = {
	jobRoleListPage: JobRoleListPage;
};

export const jobRoleFixtures = base.extend<JobRoleFixtures>({
	jobRoleListPage: async ({ page }, use) => {
		await use(new JobRoleListPage(page));
	},
});
