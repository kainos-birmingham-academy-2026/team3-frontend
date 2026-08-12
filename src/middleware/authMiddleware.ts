import type { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "../types/auth";

export function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!req.session.jwtToken) {
		res.redirect("/unauthorised");
		return;
	}
	next();
}

export function requireAdmin(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!req.session.isAdmin) {
		res.status(403).render("pages/accessRestricted.njk");
		return;
	}

	next();
}
