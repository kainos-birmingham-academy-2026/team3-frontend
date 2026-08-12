import type { NextFunction, Request, Response } from "express";

export function requireAdmin(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!req.session.jwtToken) {
		res.redirect("/login");
		return;
	}

	if (!req.session.isAdmin) {
		res.status(403).render("pages/404.njk");
		return;
	}

	next();
}
