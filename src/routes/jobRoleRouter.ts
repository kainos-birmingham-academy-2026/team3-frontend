import { Router } from "express";
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
		const applicationId = parseInt(idParam);
		const jwtToken = req.session.jwtToken ?? "";
		await adminApplicationService.approve(applicationId, jwtToken);
		res.json({ success: true });
	} catch (error) {
		const message = error instanceof Error ? error.message : "Failed to approve application";
		res.status(500).json({ error: message });
	}
});

router.post("/api/job-applications/:applicationId/reject", requireAdmin, async (req, res) => {
	try {
		const idParam = Array.isArray(req.params.applicationId) ? req.params.applicationId[0] : req.params.applicationId;
		const applicationId = parseInt(idParam);
		const jwtToken = req.session.jwtToken ?? "";
		await adminApplicationService.reject(applicationId, jwtToken);
		res.json({ success: true });
	} catch (error) {
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

router.get("/job-role-list", (req,res) => controller.getAll(req, res));
router.get("/job-role-list/:id", (req, res) => controller.getById(req, res));
router.get("/job-role-list/:id/apply", (req, res) => {
	if (!req.session.jwtToken) {
		res.redirect("/unauthorised");
		return;
	}

	controller.showApplyForm(req, res);
});
router.post(
	"/job-role-list/:id/apply",
	requireAuth,
	(req, res) => controller.submitApplication(req, res),
);
router.get(
	"/job-role-list/:id/apply/confirmation",
	requireAuth,
	(req, res) => controller.showApplicationConfirmation(req, res),
);

router.get("/job-role-create", requireAuth, requireAdmin, (_req, res) => {
	res.render("pages/jobRoleCreate.njk", {
		capabilityOptions: [],
		bandOptions: [],
		locationOptions: [],
	});
});

export default router;
