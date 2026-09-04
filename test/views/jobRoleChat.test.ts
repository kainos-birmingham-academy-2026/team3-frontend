import path from "node:path";
import nunjucks from "nunjucks";
import { describe, expect, it } from "vitest";

const environment = new nunjucks.Environment(
	new nunjucks.FileSystemLoader(path.resolve(process.cwd(), "src/views")),
);

describe("job role chat widget", () => {
	it("renders an expandable assistant on a public page", () => {
		const html = environment.render("pages/index.njk");

		expect(html).toContain('id="job-chat-toggle"');
		expect(html).toContain('aria-controls="job-chat-panel"');
		expect(html).toContain('aria-expanded="false"');
		expect(html).toContain('id="job-chat-panel"');
		expect(html).toContain('maxlength="500"');
		expect(html).toContain('aria-describedby="job-chat-character-count"');
		expect(html).toContain('id="job-chat-character-count"');
		expect(html).not.toContain(
			'id="job-chat-character-count" class="job-chat-character-count" aria-live',
		);
		expect(html).toContain("0 / 500 characters");
		expect(html).toContain("/scripts/jobRoleChat.js");
	});
});
