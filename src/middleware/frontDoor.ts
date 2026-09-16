import type { RequestHandler } from "express";

export function frontDoorGuard(expectedId: string | undefined): RequestHandler {
	return (req, res, next) => {
		if (expectedId && req.get("X-Azure-FDID") !== expectedId) {
			res.status(403).send("Forbidden");
			return;
		}
		next();
	};
}
