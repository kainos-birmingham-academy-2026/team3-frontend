import "express-session";
import type {
	BandOption,
	CapabilityOption,
	LocationOption,
	StatusOption,
} from "../models/jobRole";
import type { UserRole } from "./auth";

declare module "express-session" {
	interface SessionData {
		jwtToken?: string;
		userRole?: UserRole;
		redirectAfterLogin?: string;
		createJobRoleErrorVariant?: "A" | "B";
		createJobRoleErrorExperiment?: {
			attemptId: string;
			exposed: boolean;
		};
		dropdownOptions?: {
			statuses: StatusOption[];
			locations: LocationOption[];
			capabilities: CapabilityOption[];
			bands: BandOption[];
		};
	}
}
