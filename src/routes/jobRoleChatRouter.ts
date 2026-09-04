import axios from "axios";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { JobRoleChatService } from "../services/jobRoleChatService";

const jobRoleChatRouter = Router();
const service = new JobRoleChatService();
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: {
		message: "Too many chat requests. Please try again later.",
	},
});

jobRoleChatRouter.post("/api/job-role-chat", limiter, async (req, res) => {
	try {
		const response = await service.ask(String(req.body.message ?? ""));
		res.status(200).json(response);
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			const status = [400, 429].includes(error.response.status)
				? error.response.status
				: 503;
			res.status(status).json(error.response.data);
			return;
		}

		res.status(503).json({
			message: "The job role assistant is unavailable. Please try again later.",
		});
	}
});

export default jobRoleChatRouter;
