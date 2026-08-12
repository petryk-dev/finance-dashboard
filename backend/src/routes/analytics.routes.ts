import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/summary", analyticsController.summary);
router.get("/by-category", analyticsController.byCategory);
router.get("/monthly", analyticsController.monthly);
router.get("/recent", analyticsController.recent);

export default router;
