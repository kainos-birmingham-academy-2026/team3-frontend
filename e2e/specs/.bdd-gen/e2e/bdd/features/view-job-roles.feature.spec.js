// Generated from: e2e/bdd/features/view-job-roles.feature
import { test } from "../../../../../bdd/fixtures/test.ts";

test.describe("View open job roles", () => {
	test("View available open job roles", async ({
		Given,
		When,
		Then,
		And,
		jobRoleListPage,
	}) => {
		await Given("open and closed job roles are available");
		await When("I view the job roles list", null, { jobRoleListPage });
		await Then("I should see the available open job roles", null, {
			jobRoleListPage,
		});
		await And("I should not see closed job roles", null, { jobRoleListPage });
	});
});

// == technical section ==

test.use({
	$test: [({}, use) => use(test), { scope: "test", box: true }],
	$uri: [
		({}, use) => use("e2e/bdd/features/view-job-roles.feature"),
		{ scope: "test", box: true },
	],
	$bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [
	// bdd-data-start
	{
		pwTestLine: 6,
		pickleLine: 6,
		tags: [],
		steps: [
			{
				pwStepLine: 7,
				gherkinStepLine: 7,
				keywordType: "Context",
				textWithKeyword: "Given open and closed job roles are available",
				stepMatchArguments: [],
			},
			{
				pwStepLine: 8,
				gherkinStepLine: 8,
				keywordType: "Action",
				textWithKeyword: "When I view the job roles list",
				stepMatchArguments: [],
			},
			{
				pwStepLine: 9,
				gherkinStepLine: 9,
				keywordType: "Outcome",
				textWithKeyword: "Then I should see the available open job roles",
				stepMatchArguments: [],
			},
			{
				pwStepLine: 10,
				gherkinStepLine: 10,
				keywordType: "Outcome",
				textWithKeyword: "And I should not see closed job roles",
				stepMatchArguments: [],
			},
		],
	},
]; // bdd-data-end
