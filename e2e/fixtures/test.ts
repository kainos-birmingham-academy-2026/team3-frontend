import { expect, mergeTests } from "@playwright/test";
import { apiFixtures } from "./api";
import { authFixtures } from "./auth";
import { homeFixtures } from "./home";

export const test = mergeTests(authFixtures, homeFixtures, apiFixtures);

export { expect };
