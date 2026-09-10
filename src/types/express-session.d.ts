import "express-session";
import type {
	BandOption,
	CapabilityOption,
	LocationOption,
	StatusOption,
} from "../models/jobRole";
import type { AdminApplicationListState } from "../utils/adminApplicationListState";
import type { UserRole } from "./auth";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
		userRole?: UserRole;
		redirectAfterLogin?: string;
		jobRoleListUrl?: string;
		adminApplicationListState?: AdminApplicationListState;
		dropdownOptions?: {
			statuses: StatusOption[];
			locations: LocationOption[];
			capabilities: CapabilityOption[];
			bands: BandOption[];
		};
	}
}
