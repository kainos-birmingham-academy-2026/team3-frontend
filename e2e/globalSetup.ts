import { resetDatabase } from "./support/db";

export default function globalSetup(): void {
	resetDatabase();
}
