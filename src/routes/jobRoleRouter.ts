import { Router } from "express";
import multer from "multer";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware";
import { ApplicationService } from "../services/applicationService";
import { JobRoleService } from "../services/jobRoleService";

const router = Router();
const service = new JobRoleService();
const applicationService = new ApplicationService();
const controller = new JobRoleController(service, applicationService);
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
});

router.get("/", (_req, res) => {
	res.render("pages/index.njk");
});

router.get("/health", (_req, res) => {
	res.status(200).send({
		status: "UP",
		time: new Date().toISOString(),
	});
});

router.get("/job-role-list", requireAuth, (req,res) => controller.getAll(req, res));
router.get("/job-role-list/:id", requireAuth, (req, res) => controller.getById(req, res));
router.get("/job-role-list/:id/apply", requireAuth, (req, res) =>
	controller.showApplyPage(req, res),
);
router.post(
	"/job-role-list/:id/apply",
	requireAuth,
	upload.single("cv"),
	(req, res) => controller.submitApplication(req, res),
);

router.get("/job-role-create", requireAuth, requireAdmin, (_req, res) => {
	res.render("pages/jobRoleCreate.njk", {
		capabilityOptions: [],
		bandOptions: [],
		locationOptions: [],
	});
});

export default router;
