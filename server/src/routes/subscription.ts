import express, { Router } from "express";
import {
  getSubscriptions,
  createSubscription,
  cancelSubscription,
  initializePaystackPayment,
  verifyPaystackPayment,
  getUserTransactions,
  getUserSubscriptionStatus,
  getSubscriptionPlans,
  paystackWebhookHandler,
} from "../controllers/subscriptionController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Webhook route - NO authentication required (Paystack calls this directly)
// Use raw body parsing for webhook signature verification
router.post(
  "/webhook/paystack",
  express.raw({ type: "application/json" }),
  paystackWebhookHandler
);

// All other routes require authentication
router.use(authenticateToken);

router.get("/", getSubscriptions);
router.post("/", createSubscription);
router.put("/:id/cancel", cancelSubscription);
router.post("/initialize-payment", initializePaystackPayment);
router.post("/verify-payment", verifyPaystackPayment);
router.get("/transactions", getUserTransactions);
router.get("/status", getUserSubscriptionStatus);
router.get("/plans", getSubscriptionPlans);

export default router;
