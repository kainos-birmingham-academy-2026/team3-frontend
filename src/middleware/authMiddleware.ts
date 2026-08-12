import type { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "../types/auth";

export function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!req.session.jwtToken) {
		res.redirect("/login");
		return;
	}
	next();
}

export function requireAdmin(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (req.session.userRole !== USER_ROLES.ADMIN) {
		res.status(403).render("pages/accessRestricted.njk");
		return;
	}

	next();
}

export function requireApplicant(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (req.session.userRole !== USER_ROLES.USER) {
		res.status(403).render("pages/accessRestricted.njk");
		return;
	}

	next();
}
