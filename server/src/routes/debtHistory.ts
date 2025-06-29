import { Router } from "express";
import { body } from "express-validator";
import {
  getDebtHistory,
  addDebtHistory,
} from "../controllers/debtHistoryController";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get("/debtor/:debtorId", getDebtHistory);

router.post(
  "/",
  [
    body("debtorId").isInt().withMessage("Debtor ID must be a valid integer"),
    body("amountChanged")
      .isFloat()
      .withMessage("Amount changed must be a valid number"),
    body("action")
      .isIn(["add", "reduce", "settled"])
      .withMessage("Action must be add, reduce, or settled"),
    body("note").optional().isString(),
    validateRequest,
  ],
  addDebtHistory
);

export default router;
