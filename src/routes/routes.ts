import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { JobRoleService } from "../services/jobRoleService";

const router = Router();
const service = new JobRoleService();
const controller = new JobRoleController(service);

router.get("/", (req, res) => {
	res.send("Hello, World!");
});

router.get("/health", (req, res) => {
	res.status(200).send({
		status: "UP",
		time: new Date().toString(),
	});
});

router.get("/job-roles", (req,res) => controller.getAll(req, res));

export default router;
