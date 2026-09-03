import axios from "axios";
import { type Request, Router } from "express";
import apiClient from "../config/apiClient";
import { features } from "../config/features";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";
import { requireAdminHiringFeature } from "../middleware/featureFlags";
import { AdminApplicationService } from "../services/adminApplicationService";
import { JobRoleService } from "../services/jobRoleService";
import { UserApplicationService } from "../services/userApplicationService";
import { USER_ROLES } from "../types/auth";

const router = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);
const adminApplicationService = new AdminApplicationService();
const userApplicationService = new UserApplicationService();
type ApplicationAction = "approve" | "reject";

function getSessionToken(req: Request): string {
	return req.session.jwtToken ?? "";
}

function parseApplicationId(
	rawId: string | string[] | undefined,
): number | null {
	const idParam = Array.isArray(rawId) ? rawId[0] : rawId;
	const applicationId = Number.parseInt(idParam ?? "", 10);

	if (Number.isNaN(applicationId)) {
		return null;
	}

	return applicationId;
}

function getAxiosErrorMessage(error: unknown): string {
	if (!axios.isAxiosError(error)) {
		return error instanceof Error ? error.message : "Unknown error";
	}

	if (
		typeof error.response?.data === "object" &&
		error.response?.data !== null &&
		"message" in error.response.data &&
		typeof (error.response.data as { message?: unknown }).message === "string"
	) {
		return (error.response.data as { message: string }).message;
	}

	return error.message;
}

function parseApplicationAction(action: unknown): ApplicationAction | null {
	if (action === "approve" || action === "reject") {
		return action;
	}

	return null;
}

router.get("/", (_req, res) => {
	res.render("pages/index.njk");
});

router.get(
	"/job-applications/admin",
	requireAdminHiringFeature,
	requireAuth,
	requireAdmin,
	(req, res) => controller.getApplications(req, res),
);

router.get("/job-applications", requireAuth, async (req, res) => {
	if (req.session.userRole === USER_ROLES.ADMIN) {
		res.redirect("/job-applications/admin");
		return;
	}

	try {
		const applications = await userApplicationService.getAll(
			getSessionToken(req),
		);
		res.render("pages/jobApplications.njk", { applications });
	} catch {
		res.status(500).render("pages/jobApplications.njk", {
			applications: [],
			errorMessage:
				"We could not load your applications. Please try again later.",
		});
	}
});

router.post(
	"/job-applications/:applicationId/withdraw",
	requireAuth,
	async (req, res) => {
		if (req.session.userRole === USER_ROLES.ADMIN) {
			res.status(403).render("pages/accessRestricted.njk");
			return;
		}

		const applicationId = parseApplicationId(req.params.applicationId);
		if (applicationId === null) {
			res.status(400).render("pages/404.njk");
			return;
		}

		try {
			await userApplicationService.withdraw(
				applicationId,
				getSessionToken(req),
			);
			res.redirect(303, "/job-applications");
		} catch {
			const applications = await userApplicationService
				.getAll(getSessionToken(req))
				.catch(() => []);
			res.status(500).render("pages/jobApplications.njk", {
				applications,
				errorMessage:
					"We could not withdraw your application. Please try again.",
			});
		}
	},
);

router.get(
	"/job-applications/:applicationId/cv",
	requireAuth,
	async (req, res) => {
		try {
			const applicationId = parseApplicationId(req.params.applicationId);
			if (applicationId === null) {
				res.status(400).render("pages/404.njk");
				return;
			}

			const jwtToken = getSessionToken(req);
			const isAdmin = req.session.userRole === USER_ROLES.ADMIN;
			if (isAdmin && !features.adminHiring) {
				res.status(404).render("pages/404.njk");
				return;
			}

			const applications = isAdmin
				? await adminApplicationService.getAll(jwtToken)
				: await userApplicationService.getAll(jwtToken);
			const application = applications.find(
				(item) => item.applicationId === applicationId,
			);

			if (!application) {
				res.status(404).render("pages/404.njk");
				return;
			}

			const cvText = isAdmin
				? await adminApplicationService.getCvTextById(applicationId, jwtToken)
				: application.cvText;
			res.render("pages/applicationCv.njk", {
				application,
				backUrl: isAdmin ? "/job-applications/admin" : "/job-applications",
				heading:
					"applicantName" in application
						? application.applicantName
						: "Your CV",
				cvText:
					cvText ||
					application.cvText ||
					"No CV text available for this application.",
			});
		} catch {
			res.status(500).render("pages/404.njk", {
				errorMessage: "We could not open this CV. Please try again later.",
			});
		}
	},
);

// API endpoint for fetching applications (called by client-side JavaScript)
router.get(
	"/api/job-applications/admin",
	requireAdminHiringFeature,
	requireAuth,
	requireAdmin,
	async (req, res) => {
		try {
			const jwtToken = getSessionToken(req);
			const applications = await adminApplicationService.getAll(jwtToken);
			res.json(applications);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to fetch applications";
			res.status(500).json({ message });
		}
	},
);

router.get(
	"/api/job-applications/:applicationId/cv-text",
	requireAdminHiringFeature,
	requireAuth,
	requireAdmin,
	async (req, res) => {
		try {
			const applicationId = parseApplicationId(req.params.applicationId);
			if (applicationId === null) {
				res.status(400).json({ message: "Invalid application ID" });
				return;
			}

			const jwtToken = getSessionToken(req);
			const cvText = await adminApplicationService.getCvTextById(
				applicationId,
				jwtToken,
			);
			res.json({ cvText });
		} catch (error) {
			if (axios.isAxiosError(error)) {
				res
					.status(error.response?.status ?? 500)
					.json({ message: getAxiosErrorMessage(error) });
				return;
			}

			const message =
				error instanceof Error ? error.message : "Failed to fetch CV text";
			res.status(500).json({ message });
		}
	},
);

router.post(
	"/job-applications/:applicationId/status",
	requireAdminHiringFeature,
	requireAuth,
	requireAdmin,
	async (req, res) => {
		try {
			const applicationId = parseApplicationId(req.params.applicationId);
			const action = parseApplicationAction(req.body?.action);
			if (applicationId === null || action === null) {
				res.status(400).render("pages/404.njk");
				return;
			}

			const jwtToken = getSessionToken(req);
			if (action === "approve") {
				await adminApplicationService.approve(applicationId, jwtToken);
			} else {
				await adminApplicationService.reject(applicationId, jwtToken);
			}

			res.redirect(303, "/job-applications/admin");
		} catch (error) {
			res.status(500).render("pages/404.njk", {
				errorMessage: getAxiosErrorMessage(error),
			});
		}
	},
);

router.post(
	"/api/job-applications/:applicationId/status",
	requireAdminHiringFeature,
	requireAuth,
	requireAdmin,
	async (req, res) => {
		try {
			const applicationId = parseApplicationId(req.params.applicationId);
			if (applicationId === null) {
				res.status(400).json({ message: "Invalid application ID" });
				return;
			}

			const action = parseApplicationAction(req.body?.action);
			if (action === null) {
				res
					.status(400)
					.json({ message: "Invalid action. Use 'approve' or 'reject'." });
				return;
			}

			const jwtToken = getSessionToken(req);
			if (action === "approve") {
				await adminApplicationService.approve(applicationId, jwtToken);
			} else {
				await adminApplicationService.reject(applicationId, jwtToken);
			}

			res.json({ success: true });
		} catch (error) {
			if (axios.isAxiosError(error)) {
				res
					.status(error.response?.status ?? 500)
					.json({ message: getAxiosErrorMessage(error) });
				return;
			}

			const message =
				error instanceof Error
					? error.message
					: "Failed to update application status";
			res.status(500).json({ message });
		}
	},
);

router.get("/health", (_req, res) => {
	res.status(200).send({
		status: "UP",
		time: new Date().toISOString(),
	});
});

router.get("/job-role-list", (req, res) => controller.getAll(req, res));
router.get("/job-role-list/:id", (req, res) => controller.getById(req, res));
router.get("/job-role-list/:id/apply", (req, res) => {
	if (!req.session.jwtToken) {
		req.session.redirectAfterLogin = `/job-role-list/${req.params.id}/apply`;
		res.redirect("/unauthorised");
		return;
	}

	controller.showApplyForm(req, res);
});
router.post("/job-role-list/:id/apply", requireAuth, (req, res) =>
	controller.submitApplication(req, res),
);
router.get("/job-role-list/:id/apply/confirmation", requireAuth, (req, res) =>
	controller.showApplicationConfirmation(req, res),
);

router.get("/job-role-create", requireAuth, requireAdmin, (req, res) =>
	controller.showCreateForm(req, res),
);
router.post("/job-role-create", requireAuth, requireAdmin, (req, res) =>
	controller.createJobRole(req, res),
);
router.get("/job-role-edit/:id", requireAuth, requireAdmin, (req, res) =>
	controller.showEditForm(req, res),
);
router.post("/job-role-edit", requireAuth, requireAdmin, (req, res) =>
	controller.updateJobRole(req, res),
);
router.post(
	"/job-role-list/:id/delete",
	requireAuth,
	requireAdmin,
	(req, res) => controller.deleteJobRole(req, res),
);

router.get("/teapot", async (_req, res) => {
	try {
		await apiClient.get("/teapot", {
			validateStatus: (status) => status === 418,
		});
	} catch {
		// Keep the informational page available when the backend is unavailable.
	}

	res.render("pages/teapot.njk");
});

export default router;
