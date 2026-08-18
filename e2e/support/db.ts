import { execFileSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { backendDir } from "./config";

dotenv.config({ path: path.join(backendDir, ".env") });

export type UserRecord = {
	email: string;
	passwordHash: string;
	role: string;
};

async function withClient<T>(run: (client: Client) => Promise<T>): Promise<T> {
	const client = new Client({ connectionString: process.env.DATABASE_URL });
	await client.connect();

	try {
		return await run(client);
	} finally {
		await client.end();
	}
}

export async function findUserByEmail(
	email: string,
): Promise<UserRecord | null> {
	return withClient(async (client) => {
		const result = await client.query<UserRecord>(
			'SELECT email, "passwordHash", role FROM "User" WHERE email = $1',
			[email],
		);

		return result.rows[0] ?? null;
	});
}

export async function deleteUserByEmail(email: string): Promise<void> {
	await withClient((client) =>
		client.query('DELETE FROM "User" WHERE email = $1', [email]),
	);
}

export function resetDatabase(): void {
	execFileSync(
		"npx",
		["prisma", "migrate", "reset", "--force", "--skip-generate"],
		{
			cwd: backendDir,
			stdio: "inherit",
		},
	);
}
