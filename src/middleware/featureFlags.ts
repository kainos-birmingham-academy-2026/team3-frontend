import type { NextFunction, Request, Response } from "express";
import { features } from "../config/features";

export function requireAdminHiringFeature(
	_req: Request,
	res: Response,
	next: NextFunction,
): void {
	if (!features.adminHiring) {
		res.status(404).render("pages/404.njk");
		return;
	}

	next();
}