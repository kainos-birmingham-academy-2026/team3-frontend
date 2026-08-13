import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";
import { JobRoleService } from "../services/jobRoleService";

const router = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);

router.get("/", (_req, res) => {
	res.render("pages/index.njk");
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
