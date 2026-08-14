import axios from "axios";
import type { Request, Response } from "express";
import type {
	BandOption,
	CapabilityOption,
	CreateJobRoleInput,
	JobRole,
	LocationOption,
	SchemaError,
	StatusOption,
} from "../models/jobRole";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
	constructor(private jobRoleService: JobRoleService) { }

	private getJwtToken(req: Request): string | undefined {
		return req.session.jwtToken;
	}

	private getRoleIdParam(req: Request): string {
		return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
	}

	private canApplyForRole(jobRole: JobRole): boolean {
		return jobRole.status === "open" && (jobRole.openPositions ?? 0) > 0;
	}


	private async getDropdownOptions(): Promise<{
		statuses: StatusOption[];
		locations: LocationOption[];
		capabilities: CapabilityOption[];
		bands: BandOption[];
	}> {
		try {
			const [statuses, locations, capabilities, bands] = await Promise.all([
				this.jobRoleService.getAllStatuses(),
				this.jobRoleService.getAllLocations(),
				this.jobRoleService.getAllCapabilities(),
				this.jobRoleService.getAllBands(),
			]);

			return { statuses, locations, capabilities, bands };
		} catch {
			throw new Error("Failed to fetch dropdown options");
		}
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

	async showCreateForm(req: Request, res: Response): Promise<void> {
		try {
			const dropdownOptions = await this.getDropdownOptions();
			req.session.dropdownOptions = dropdownOptions;
			res.render("pages/jobRoleCreate.njk", {
				canCreate: true,
				capabilityOptions: dropdownOptions.capabilities,
				bandOptions: dropdownOptions.bands,
				locationOptions: dropdownOptions.locations,
				statusOptions: dropdownOptions.statuses,
			});
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) {
				return;
			}
			this.renderApiError(res, error);
		}
	}

	async createJobRole(req: Request, res: Response): Promise<void> {
		try {
			const jobRoleData = req.body as CreateJobRoleInput;
			await this.jobRoleService.createJobRole(jobRoleData, this.getJwtToken(req));
			res.redirect("/job-role-list");
		} catch (error) {
			if (this.handleUnauthorized(req, res, error)) {
				return;
			}

			let errorMessage: string | SchemaError[] = "Unable to create job role";
			let statusCode = 500;

			if (axios.isAxiosError(error)) {
				statusCode = error.response?.status ?? 500;

				const responseData = error.response?.data as {
					errors?: SchemaError[];
					error?: string;
					message?: string;
				};

				if (statusCode === 400) {
					if (Array.isArray(responseData?.errors)) {
						errorMessage = responseData.errors;
					} else if (responseData?.error) {
						errorMessage = [
							{
								field: responseData.error.toLowerCase().includes("closing date")
									? "closingDate"
									: undefined,
								message: responseData.error,
							},
						];
					} else if (responseData?.message) {
						errorMessage = responseData.message;
					} else {
						errorMessage = "Please provide valid job role data.";
					}
				} else if (statusCode === 401) {
					req.session.jwtToken = undefined;
					req.session.userRole = undefined;
					res.redirect("/login");
					return;
				} else if (statusCode === 403) {
					errorMessage = "You do not have permission to create a job role.";
				} else if (statusCode >= 500) {
					errorMessage = "The job role could not be created. Please try again.";
				}
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			res.status(statusCode).render("pages/jobRoleCreate.njk", {
				canCreate: statusCode !== 403,
				errorMessage,
				capabilityOptions: req.session.dropdownOptions?.capabilities ?? [],
				bandOptions: req.session.dropdownOptions?.bands ?? [],
				locationOptions: req.session.dropdownOptions?.locations ?? [],
				statusOptions: req.session.dropdownOptions?.statuses ?? [],
			});
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

			res.status(201).render("pages/jobRoleApply.njk", {
				jobRoleId,
				canApply: true,
				successMessage: "Application submitted successfully.",
				applicationStatus: "in progress",
			});
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


	//fetch status, location, capability and band options from the backend to populate the dropdowns in the create job role
	//not used in controller as show create form will call directly to service, but kept as a reference for future use if needed
	async getAllStatuses(): Promise<StatusOption[]> {
		try {
			const statuses = await this.jobRoleService.getAllStatuses();
			return statuses;
		} catch {
			throw new Error("Failed to fetch job role statuses");
		}
	}

	async getAllLocations(): Promise<LocationOption[]> {
		try {
			const locations = await this.jobRoleService.getAllLocations();
			return locations;
		} catch {
			throw new Error("Failed to fetch job role locations");
		}
	}

	async getAllCapabilities(): Promise<CapabilityOption[]> {
		try {
			const capabilities = await this.jobRoleService.getAllCapabilities();
			return capabilities;
		} catch {
			throw new Error("Failed to fetch job role capabilities");
		}
	}

	async getAllBands(): Promise<BandOption[]> {
		try {
			const bands = await this.jobRoleService.getAllBands();
			return bands;
		} catch {
			throw new Error("Failed to fetch job role bands");
		}
	}


}
