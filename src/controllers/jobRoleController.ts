import axios from "axios";
import type { Request, Response } from "express";
import type { JobRole } from "../models/jobRole";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private jobRoleService: JobRoleService) {}

	private getJwtToken(req: Request): string | undefined {
		return req.session.jwtToken;
	}

	private getRoleIdParam(req: Request): string {
		return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
	}

	private canApplyForRole(jobRole: JobRole): boolean {
		return jobRole.status === "open" && (jobRole.openPositions ?? 0) > 0;
	}

	async getAll(req: Request, res: Response): Promise<void> {
		const jwtToken = this.getJwtToken(req);

		if (!jwtToken) {
			res.redirect("/login");
			return;
		}

		try {
			const jobRoles = await this.jobRoleService.getAll(jwtToken);
			res.render("pages/jobRoleList.njk", { jobRoles });
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) {
				return;
			}
			this.renderApiError(res, error);
		}
	}

	async getById(req: Request, res: Response): Promise<void> {
		try {
			const id = this.getRoleIdParam(req);
			const jobRoleId = await this.jobRoleService.getById(
				id,
				this.getJwtToken(req),
			);
			res.render("pages/jobRoleDetail.njk", { jobRoleId });
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) {
				return;
			}
			this.renderApiError(res, error);
		}
	}

	async showApplyForm(req: Request, res: Response): Promise<void> {
		try {
			const id = this.getRoleIdParam(req);
			const jobRoleId = await this.jobRoleService.getById(
				id,
				this.getJwtToken(req),
			);

			if (!this.canApplyForRole(jobRoleId)) {
				res.status(400).render("pages/jobRoleApply.njk", {
					jobRoleId,
					canApply: false,
					errorMessage: "This role is not currently accepting applications.",
				});
				return;
			}

			res.render("pages/jobRoleApply.njk", {
				jobRoleId,
				canApply: true,
			});
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) {
				return;
			}

			const errorMessage =
				error instanceof Error
					? error.message
					: "Unable to load the apply page";

			res.status(500).render("pages/jobRoleApply.njk", {
				canApply: false,
				errorMessage,
			});
		}
	}

	async submitApplication(req: Request, res: Response): Promise<void> {
		const id = this.getRoleIdParam(req);
		let jobRoleId: JobRole | undefined;

		try {
			jobRoleId = await this.jobRoleService.getById(id, this.getJwtToken(req));

			if (!this.canApplyForRole(jobRoleId)) {
				res.status(400).render("pages/jobRoleApply.njk", {
					jobRoleId,
					canApply: false,
					errorMessage: "This role is not currently accepting applications.",
				});
				return;
			}

			const cvText = String(req.body.cvText ?? "").trim();

			if (!cvText) {
				res.status(400).render("pages/jobRoleApply.njk", {
					jobRoleId,
					canApply: true,
					errorMessage: "Please enter your CV text before submitting.",
				});
				return;
			}

			await this.jobRoleService.applyForRole(id, cvText, this.getJwtToken(req));

			res.redirect(303, `/job-role-list/${id}/apply/confirmation`);
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) {
				return;
			}

			let errorMessage = "Unable to submit your application";
			let statusCode = 500;

			if (axios.isAxiosError(error)) {
				statusCode = error.response?.status ?? 500;

				if (statusCode === 404) {
					errorMessage = "Job role not found.";
				} else if (statusCode === 409) {
					errorMessage = "You have already applied for this role.";
				} else if (statusCode === 400) {
					errorMessage = "Please provide a valid CV file.";
				} else if (statusCode === 413) {
					errorMessage = "The uploaded CV is too large.";
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			res.status(statusCode).render("pages/jobRoleApply.njk", {
				jobRoleId,
				canApply: jobRoleId ? this.canApplyForRole(jobRoleId) : false,
				errorMessage,
			});
		}
	}

	showApplicationConfirmation(req: Request, res: Response): void {
		const id = this.getRoleIdParam(req);
		res.render("pages/applicationReceivedConfirmation.njk", {
			jobRoleId: id,
		});
	}

	private handleUnauthorized(
		req: Request,
		res: Response,
		error: unknown,
	): boolean {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			req.session.jwtToken = undefined;
			req.session.userRole = undefined;
			res.redirect("/login");
			return true;
		}

		return false;
	}

	private renderApiError(res: Response, error: unknown): void {
		const errorMessage =
			error instanceof Error ? error.message : "Unable to load job roles";

		res.status(500).render("pages/jobRoleList.njk", {
			jobRoles: [],
			errorMessage,
		});
	}
}
