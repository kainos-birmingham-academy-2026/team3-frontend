import { expect, mergeTests } from "@playwright/test";
import { apiFixtures } from "./api";
import { authFixtures } from "./auth";
import { homeFixtures } from "./home";
import { jobRoleFixtures } from "./jobRoles";

export const test = mergeTests(
	authFixtures,
	homeFixtures,
	jobRoleFixtures,
	apiFixtures,
);

export { expect };
