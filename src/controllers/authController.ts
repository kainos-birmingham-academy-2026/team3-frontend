import type { Request, Response } from "express";
import * as authApiService from "../services/authApiService";

export class AuthController {
	showLogin(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/");
			return;
		}

		res.render("pages/login.njk", {
			formValues: { username: "" },
		});
	}

	async login(req: Request, res: Response): Promise<void> {
		const username = String(req.body.username ?? "").trim();
		const password = String(req.body.password ?? "").trim();

		if (!username || !password) {
			res.status(400).render("pages/login.njk", {
				errorMessage: "Enter both username and password",
				formValues: { username },
			});
			return;
		}

		try {
			const jwtToken = await authApiService.login(username, password);
			req.session.jwtToken = jwtToken;
			res.redirect("/");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to sign in";
			res.status(401).render("pages/login.njk", {
				errorMessage: message,
				formValues: { username },
			});
		}
	}

	logout(req: Request, res: Response): void {
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.redirect("/login");
		});
	}
}
