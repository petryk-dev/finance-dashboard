import { Router } from "express";
import * as transactionController from "../controllers/transaction.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", transactionController.list);
router.post("/", transactionController.create);
router.put("/:id", transactionController.update);
router.delete("/:id", transactionController.remove);

export default router;
