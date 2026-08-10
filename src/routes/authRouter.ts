import { Router } from "express";
import { AuthController } from "../controllers/authController.js";

const router = Router();
const authController = new AuthController();

router.get("/login", (req, res) => authController.showLogin(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get("/logout", (req, res) => authController.logout(req, res));

export default router;
