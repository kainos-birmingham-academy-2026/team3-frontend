import { resetDatabase } from "./support/db";

export default function globalTeardown(): void {
	resetDatabase();
}
