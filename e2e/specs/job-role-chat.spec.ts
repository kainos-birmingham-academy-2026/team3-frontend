import { expect, test } from "../fixtures/test";

test("applicant can ask the chatbot about a job role @smoke", async ({
	page,
}) => {
	await page.route("**/api/job-role-chat", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				answer:
					"The Software Engineer role is based in Belfast and has two open positions.",
				roles: [{ jobRoleId: 1, roleName: "Software Engineer" }],
			}),
		});
	});

	await page.goto("/");
	const toggle = page.getByRole("button", {
		name: "Open job role assistant",
	});
	await toggle.click();
	await page
		.getByLabel("Your question")
		.fill("Where is Software Engineer based?");
	await page.getByRole("button", { name: "Send" }).click();

	await expect(
		page.getByText(
			"The Software Engineer role is based in Belfast and has two open positions.",
		),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: "View Software Engineer" }),
	).toHaveAttribute("href", "/job-role-list/1");

	await page.keyboard.press("Escape");
	await expect(page.locator("#job-chat-panel")).toBeHidden();
	await expect(toggle).toBeFocused();
});
