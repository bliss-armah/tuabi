import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/database";
import {
  initializeTransaction,
  verifyTransaction,
} from "../services/paystackService";
import { v4 as uuidv4 } from "uuid";

export const getSubscriptions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createSubscription = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { planId, endDate, paystackSubscriptionId, paystackCustomerId } =
      req.body;

    // Fetch the plan to get duration if endDate is not provided
    let calculatedEndDate = endDate ? new Date(endDate) : undefined;
    if (!calculatedEndDate) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });
      if (!plan) {
        return res.status(400).json({
          success: false,
          message: "Invalid planId",
        });
      }
      calculatedEndDate = new Date();
      calculatedEndDate.setDate(calculatedEndDate.getDate() + plan.duration);
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user!.id,
        planId,
        endDate: calculatedEndDate,
        paystackSubscriptionId,
        paystackCustomerId,
      },
    });

    // Update user subscription status
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        isSubscribed: true,
        subscriptionExpiresAt: calculatedEndDate,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const cancelSubscription = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const subscriptionId = parseInt(id);

    if (isNaN(subscriptionId)) {
      res.status(400).json({
        success: false,
        message: "Invalid subscription ID",
      });
      return;
    }

    // Check if subscription exists and belongs to user
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: req.user!.id,
      },
    });

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
      return;
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "cancelled" },
    });

    // Update user subscription status if this was the active subscription
    if (subscription.status === "active") {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          isSubscribed: false,
          subscriptionExpiresAt: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const initializePaystackPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { amount, planType, currency } = req.body;
    const user = req.user!;
    const reference = uuidv4();

    // Create a pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: parseFloat(amount),
        currency: currency || "NGN",
        status: "pending",
        paystackReference: reference,
        paystackTransactionId: reference, // Use reference as temporary ID
        description: `Subscription payment for ${planType}`,
        transactionMetadata: JSON.stringify({ planType }),
      },
    });

    // Initialize Paystack transaction
    const paystackRes = await initializeTransaction(user.email, amount, {
      userId: user.id,
      planType,
      transactionId: transaction.id,
      reference,
    });

    // Update transaction with Paystack transaction ID
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { paystackTransactionId: paystackRes.reference },
    });

    return res.status(200).json({
      success: true,
      data: paystackRes,
    });
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
    });
  }
};

export const verifyPaystackPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { reference } = req.body;
    const user = req.user!;

    // Verify with Paystack
    const paystackRes = await verifyTransaction(reference);

    // Find the transaction by reference
    const transaction = await prisma.transaction.findFirst({
      where: { paystackReference: reference, userId: user.id },
    });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: paystackRes.status === "success" ? "success" : "failed",
        paystackTransactionId:
          paystackRes.id?.toString() || transaction.paystackTransactionId,
        transactionMetadata: JSON.stringify(paystackRes),
      },
    });

    // If successful, create or update subscription
    if (paystackRes.status === "success") {
      const now = new Date();
      let planId: number | undefined = undefined;
      // Try to get planId from transaction metadata or paystackRes.metadata
      if (paystackRes.metadata?.planId) {
        planId = Number(paystackRes.metadata.planId);
      } else if (transaction && transaction.transactionMetadata) {
        try {
          const meta = JSON.parse(transaction.transactionMetadata);
          if (meta.planId) planId = Number(meta.planId);
        } catch {}
      }
      if (!planId) {
        return res.status(400).json({
          success: false,
          message: "planId missing from payment metadata",
        });
      }
      // Fetch plan to get duration
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });
      if (!plan) {
        return res.status(400).json({
          success: false,
          message: "Invalid planId",
        });
      }
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + plan.duration);
      await prisma.subscription.create({
        data: {
          userId: user.id,
          planId,
          status: "active",
          startDate: now,
          endDate,
          paystackSubscriptionId: paystackRes.subscription
            ? paystackRes.subscription.toString()
            : undefined,
          paystackCustomerId: paystackRes.customer
            ? paystackRes.customer.toString()
            : undefined,
        },
      });
      // Update user
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isSubscribed: true,
          subscriptionExpiresAt: endDate,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: paystackRes,
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

export const getUserTransactions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Get user transactions error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserSubscriptionStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        isSubscribed: true,
        subscriptionExpiresAt: true,
      },
    });

    // Get the most recent active subscription
    const currentPlan = await prisma.subscription.findFirst({
      where: {
        userId: req.user!.id,
        status: "active",
        endDate: { gte: new Date() },
      },
      orderBy: { endDate: "desc" },
    });

    // Get recent successful transactions
    const activeTransactions = await prisma.transaction.findMany({
      where: {
        userId: req.user!.id,
        status: "success",
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        is_subscribed: user?.isSubscribed || false,
        subscription_expires_at: user?.subscriptionExpiresAt,
        current_plan: currentPlan,
        active_transactions: activeTransactions,
      },
    });
  } catch (error) {
    console.error("Get user subscription status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSubscriptionPlans = async (_req: any, res: Response) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { amount: "asc" },
    });
    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
