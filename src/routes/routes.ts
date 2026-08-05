import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
	res.send("Hello, World!");
});

router.get("/health", (req, res) => {
	res.status(200).send({
		status: "UP",
		time: new Date().toString(),
	});
});

export default router;
