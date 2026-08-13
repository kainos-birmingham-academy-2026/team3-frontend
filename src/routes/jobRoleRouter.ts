import { Router } from "express";
import axios from "axios";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";
import { JobRoleService } from "../services/jobRoleService";
import { AdminApplicationService } from "../services/adminApplicationService";

const router = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);
const adminApplicationService = new AdminApplicationService();

router.get("/", (_req, res) => {
	res.render("pages/index.njk");
});

router.get("/job-applications/admin", requireAdmin, (req, res) => controller.getApplications(req, res));

// API endpoint for fetching applications (called by client-side JavaScript)
router.get("/api/job-applications/admin", requireAdmin, async (req, res) => {
	try {
		const jwtToken = req.session.jwtToken ?? "";
		const applications = await adminApplicationService.getAll(jwtToken);
		res.json(applications);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to fetch applications";
		res.status(500).json({ error: message });
	}
});

router.post("/api/job-applications/:applicationId/approve", requireAdmin, async (req, res) => {
	try {
		const idParam = Array.isArray(req.params.applicationId) ? req.params.applicationId[0] : req.params.applicationId;
		const applicationId = Number.parseInt(idParam, 10);
		if (Number.isNaN(applicationId)) {
			res.status(400).json({ error: "Invalid application ID" });
			return;
		}
		const jwtToken = req.session.jwtToken ?? "";
		await adminApplicationService.approve(applicationId, jwtToken);
		res.json({ success: true });
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const message =
				typeof error.response?.data === "object" &&
				error.response?.data !== null &&
				"error" in error.response.data &&
				typeof (error.response.data as { error?: unknown }).error === "string"
					? (error.response.data as { error: string }).error
					: error.message;

			res.status(error.response?.status ?? 500).json({ error: message });
			return;
		}

		const message = error instanceof Error ? error.message : "Failed to approve application";
		res.status(500).json({ error: message });
	}
});

router.post("/api/job-applications/:applicationId/reject", requireAdmin, async (req, res) => {
	try {
		const idParam = Array.isArray(req.params.applicationId) ? req.params.applicationId[0] : req.params.applicationId;
		const applicationId = Number.parseInt(idParam, 10);
		if (Number.isNaN(applicationId)) {
			res.status(400).json({ error: "Invalid application ID" });
			return;
		}
		const jwtToken = req.session.jwtToken ?? "";
		await adminApplicationService.reject(applicationId, jwtToken);
		res.json({ success: true });
	} catch (error) {
		if (axios.isAxiosError(error)) {
			const message =
				typeof error.response?.data === "object" &&
				error.response?.data !== null &&
				"error" in error.response.data &&
				typeof (error.response.data as { error?: unknown }).error === "string"
					? (error.response.data as { error: string }).error
					: error.message;

			res.status(error.response?.status ?? 500).json({ error: message });
			return;
		}

		const message = error instanceof Error ? error.message : "Failed to reject application";
		res.status(500).json({ error: message });
	}
});

router.get("/health", (_req, res) => {
	res.status(200).send({
		status: "UP",
		time: new Date().toISOString(),
	});
});

router.get("/job-role-list", requireAuth, (req,res) => controller.getAll(req, res));
router.get("/job-role-list/:id", requireAuth, (req, res) => controller.getById(req, res));

router.get("/job-role-create", requireAuth, requireAdmin, (_req, res) => {
	res.render("pages/jobRoleCreate.njk", {
		capabilityOptions: [],
		bandOptions: [],
		locationOptions: [],
	});
});

export default router;
