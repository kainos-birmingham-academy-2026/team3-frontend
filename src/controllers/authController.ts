import type { Request, Response } from "express";
import * as authApiService from "../services/authApiService";

export class AuthController {
	showLogin(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/");
			return;
		}

		res.render("pages/login.njk", {
			formValues: { email: "" },
		});
	}

	async login(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "").trim();

		if (!email || !password) {
			res.status(400).render("pages/login.njk", {
				errorMessage: "Enter both email and password",
				formValues: { email },
			});
			return;
		}

		try {
			const jwtToken = await authApiService.login(email, password);
			req.session.jwtToken = jwtToken;
			res.redirect("/");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to sign in";
			res.status(401).render("pages/login.njk", {
				errorMessage: message,
				formValues: { email },
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
