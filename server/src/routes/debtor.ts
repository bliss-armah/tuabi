import { Router } from "express";
import { body } from "express-validator";
import {
  getAllDebtors,
  getDebtorById,
  createDebtor,
  updateDebtor,
  incrementDebtorAmount,
  decrementDebtorAmount,
  getDashboardData,
} from "../controllers/debtorController";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Existing routes
router.get("/", getAllDebtors);
router.get("/dashboard", getDashboardData);
router.get("/:id", getDebtorById);

router.post(
  "/",
  [
    body("name").trim().isLength({ min: 1 }).withMessage("Name is required"),
    body("amountOwed")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("description").optional().isString(),
    body("phoneNumber").optional().isString(),
    validateRequest,
  ],
  createDebtor
);

router.put(
  "/:id",
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Name cannot be empty"),
    body("amountOwed")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("description").optional().isString(),
    body("phoneNumber").optional().isString(),
    validateRequest,
  ],
  updateDebtor
);

router.patch(
  "/:id/increment",
  [
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number greater than 0"),
    body("note").optional().isString().withMessage("Note must be a string"),
    validateRequest,
  ],
  incrementDebtorAmount
);

router.patch(
  "/:id/decrement",
  [
    body("amount")
      .isFloat({ min: 0.01 })
      .withMessage("Amount must be a positive number greater than 0"),
    body("note").optional().isString().withMessage("Note must be a string"),
    validateRequest,
  ],
  decrementDebtorAmount
);

export default router;
