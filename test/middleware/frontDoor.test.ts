import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { frontDoorGuard } from "../../src/middleware/frontDoor";

describe("Front Door origin guard", () => {
	function app(expectedId?: string) {
		const server = express();
		server.use(frontDoorGuard(expectedId));
		server.get("/", (_req, res) => res.send("OK"));
		return server;
	}

	it("preserves callers with the gate disabled", async () => {
		expect((await request(app()).get("/")).status).toBe(200);
	});

	it("rejects direct requests without an identifier", async () => {
		expect((await request(app("profile-id")).get("/")).status).toBe(403);
	});

	it("rejects another profile and combined identifiers", async () => {
		for (const value of ["other-profile", "profile-id, other-profile"]) {
			expect(
				(await request(app("profile-id")).get("/").set("X-Azure-FDID", value))
					.status,
			).toBe(403);
		}
	});

	it("accepts the configured profile", async () => {
		expect(
			(
				await request(app("profile-id"))
					.get("/")
					.set("X-Azure-FDID", "profile-id")
			).status,
		).toBe(200);
	});
});
