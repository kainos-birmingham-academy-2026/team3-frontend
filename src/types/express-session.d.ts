import "express-session";
import type { UserRole } from "./auth";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
		userRole?: UserRole;
		isAdmin?: boolean;
	}
}