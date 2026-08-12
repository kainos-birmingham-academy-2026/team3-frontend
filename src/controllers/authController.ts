import type { Request, Response } from "express";
import * as authApiService from "../services/authApiService";
import { getUserRoleFromToken } from "../services/tokenPayloadService";

function isStrongPassword(password: string): boolean {
	return (
		password.length > 8 &&
		/[a-z]/.test(password) &&
		/[A-Z]/.test(password) &&
		/[^A-Za-z0-9]/.test(password)
	);
}

export class AuthController {
	showLogin(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/");
			return;
		}

		const successMessage = req.query?.registered === "1"
			? "Account created. Please sign in."
			: undefined;

		res.render("pages/login.njk", {
			formValues: { email: "" },
			successMessage,
		});
	}

	showRegister(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/");
			return;
		}

		res.render("pages/register.njk", {
			formValues: { email: "" },
		});
	}

	showRegisterConfirmation(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/");
			return;
		}

		res.render("pages/registerConfirmation.njk");
	}

	showLogoutConfirmation(req: Request, res: Response): void {
		if (req.session.jwtToken) {
			res.redirect("/");
			return;
		}

		res.render("pages/logoutConfirmation.njk");
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
			const userRole = getUserRoleFromToken(jwtToken);

			if (!userRole) {
				throw new Error("Sign-in could not be completed. Please try again.");
			}

			req.session.jwtToken = jwtToken;
			req.session.userRole = userRole;
			
			// Decode JWT to check for admin role
			const tokenParts = jwtToken.split(".");
			if (tokenParts.length === 3) {
				try {
					const payload = JSON.parse(Buffer.from(tokenParts[1], "base64").toString());
					req.session.isAdmin = payload.role === "admin" || payload.isAdmin === true;
				} catch {
					req.session.isAdmin = false;
				}
			}
			
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

	async register(req: Request, res: Response): Promise<void> {
		const email = String(req.body.email ?? "").trim();
		const password = String(req.body.password ?? "").trim();
		const confirmPassword = String(req.body.confirmPassword ?? "").trim();

		if (!email || !password || !confirmPassword) {
			res.status(400).render("pages/register.njk", {
				errorMessage: "Enter email, password and confirm password",
				formValues: { email },
			});
			return;
		}

		if (password !== confirmPassword) {
			res.status(400).render("pages/register.njk", {
				errorMessage: "Passwords do not match",
				formValues: { email },
			});
			return;
		}

		if (!isStrongPassword(password)) {
			res.status(400).render("pages/register.njk", {
				errorMessage: "Password must be more than 8 characters and include upper, lower and special characters",
				formValues: { email },
			});
			return;
		}

		try {
			await authApiService.register(email, password);
			res.redirect("/register/confirmation");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to register";
			res.status(400).render("pages/register.njk", {
				errorMessage: message,
				formValues: { email },
			});
		}
	}

	logout(req: Request, res: Response): void {
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.redirect("/logout/confirmation");
		});
	}
}
