import { Router } from "express";
import {
  getSubscriptions,
  createSubscription,
  cancelSubscription,
  initializePaystackPayment,
  verifyPaystackPayment,
  getUserTransactions,
} from "../controllers/subscriptionController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get("/", getSubscriptions);
router.post("/", createSubscription);
router.put("/:id/cancel", cancelSubscription);
router.post("/initialize", initializePaystackPayment);
router.post("/verify", verifyPaystackPayment);
router.get("/transactions", getUserTransactions);

export default router;
