import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

router.use(authLimiter);

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

export default router;
