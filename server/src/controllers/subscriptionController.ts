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
      status: true,
      message: "Subscriptions retrieved successfully",
      data: subscriptions,
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
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
          status: false,
          message: "Invalid planId",
          data: null,
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
      status: true,
      message: "Subscription created successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
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
        status: false,
        message: "Invalid subscription ID",
        data: null,
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
        status: false,
        message: "Subscription not found",
        data: null,
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
      status: true,
      message: "Subscription cancelled successfully",
      data: updatedSubscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
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

    // For Paystack webview, we don't need to initialize a transaction on Paystack's side
    // The webview will handle the transaction creation
    // We just need to return success to allow the client to proceed
    return res.status(200).json({
      status: true,
      message: "Payment ready to initialize",
      data: {
        reference: uuidv4(), // Generate a temporary reference for client-side tracking
        amount: parseFloat(amount),
        currency: currency || "GHS",
        planType,
      },
    });
  } catch (error) {
    console.error("Paystack initialize error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to initialize payment",
      data: null,
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

    // For Paystack webview, we create the transaction record during verification
    // Check if transaction already exists
    let transaction = await prisma.transaction.findFirst({
      where: { paystackReference: reference, userId: user.id },
    });

    if (!transaction) {
      // Try finding by paystackTransactionId as fallback
      transaction = await prisma.transaction.findFirst({
        where: { paystackTransactionId: reference, userId: user.id },
      });
    }

    // If transaction doesn't exist, create it (this happens with webview payments)
    if (!transaction) {
      transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: paystackRes.data.amount / 100, // Convert from kobo to naira
          currency: paystackRes.data.currency || "GHS",
          status: paystackRes.status === "success" ? "success" : "failed",
          paystackReference: reference,
          paystackTransactionId: paystackRes.data.id?.toString() || reference,
          description: `Subscription payment via Paystack webview`,
          transactionMetadata: JSON.stringify(paystackRes),
        },
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
      // Try to get planId from Paystack response metadata
      if (paystackRes.data.metadata?.plan_id) {
        planId = Number(paystackRes.data.metadata.plan_id);
      } else if (paystackRes.data.metadata?.planId) {
        planId = Number(paystackRes.data.metadata.planId);
      }
      if (!planId) {
        return res.status(400).json({
          status: false,
          message: "planId missing from payment metadata",
          data: null,
        });
      }
      // Fetch plan to get duration
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });
      if (!plan) {
        return res.status(400).json({
          status: false,
          message: "Invalid planId",
          data: null,
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
      status: true,
      message: "Payment verified successfully",
      data: paystackRes,
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to verify payment",
      data: null,
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
      status: true,
      message: "Transactions retrieved successfully",
      data: transactions,
    });
  } catch (error) {
    console.error("Get user transactions error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
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
      status: true,
      message: "Subscription status retrieved successfully",
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
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const getSubscriptionPlans = async (_req: any, res: Response) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { amount: "asc" },
    });
    res.status(200).json({
      status: true,
      message: "Subscription plans retrieved successfully",
      data: plans,
    });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      data: null,
    });
  }
};
