import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { requireAuth } from "../middleware/authMiddleware";
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

router.get("/job-role-list", requireAuth, (req,res) => controller.getAll(req, res));
router.get("/job-role-list/:id", (req, res) => controller.getById(req, res));


export default router;
