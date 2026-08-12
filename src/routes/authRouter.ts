import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = new AuthController();

router.get("/login", (req, res) => authController.showLogin(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get("/register", (req, res) => authController.showRegister(req, res));
router.get("/register/confirmation", (req, res) =>
	authController.showRegisterConfirmation(req, res),
);
router.post("/register", (req, res) => authController.register(req, res));
router.get("/logout", (req, res) => authController.logout(req, res));

export default router;
