import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/database";
import {
  initializeTransaction,
  verifyTransaction,
} from "../services/paystackService";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

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
    const { amount, planId, currency } = req.body;
    const user = req.user!;

    // Call Paystack to initialize the transaction
    const paystackRes = await initializeTransaction(user.email, amount, {
      planId,
      userId: user.id,
    });

    // Return the Paystack payment URL and reference to the frontend
    return res.status(200).json({
      status: true,
      message: "Payment initialized successfully",
      data: {
        authorization_url: paystackRes.data.authorization_url,
        reference: paystackRes.data.reference,
        amount: amount,
        currency: currency || "GHS",
        planId,
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

// export const verifyPaystackPayment = async (
//   req: AuthenticatedRequest,
//   res: Response
// ) => {
//   try {
//     const { reference } = req.body;
//     const user = req.user!;

//     // Verify with Paystack
//     const paystackRes = await verifyTransaction(reference);

//     // For Paystack webview, we create the transaction record during verification
//     // Check if transaction already exists
//     let transaction = await prisma.transaction.findFirst({
//       where: { paystackReference: reference, userId: user.id },
//     });

//     if (!transaction) {
//       // Try finding by paystackTransactionId as fallback
//       transaction = await prisma.transaction.findFirst({
//         where: { paystackTransactionId: reference, userId: user.id },
//       });
//     }

//     // If transaction doesn't exist, create it (this happens with webview payments)
//     if (!transaction) {
//       transaction = await prisma.transaction.create({
//         data: {
//           userId: user.id,
//           amount: paystackRes.data.amount / 100, // Convert from kobo to naira
//           currency: paystackRes.data.currency || "GHS",
//           status: paystackRes.status === "success" ? "success" : "failed",
//           paystackReference: reference,
//           paystackTransactionId: paystackRes.data.id?.toString() || reference,
//           description: `Subscription payment via Paystack webview`,
//           transactionMetadata: JSON.stringify(paystackRes),
//         },
//       });
//       console.log("Transaction created:");
//     }

//     // Update transaction status
//     await prisma.transaction.update({
//       where: { id: transaction.id },
//       data: {
//         status: paystackRes.status === "success" ? "success" : "failed",
//         paystackTransactionId:
//           paystackRes.id?.toString() || transaction.paystackTransactionId,
//         transactionMetadata: JSON.stringify(paystackRes),
//       },
//     });

//     // If successful, create or update subscription
//     if (paystackRes.status === "success") {
//       const now = new Date();
//       let planId: number | undefined = undefined;

//       if (paystackRes.data.metadata?.planId) {
//         planId = Number(paystackRes.data.metadata.planId);
//       } else if (paystackRes.data.metadata?.planId) {
//         planId = Number(paystackRes.data.metadata.planId);
//       } else {
//         console.log("No plan ID found in metadata");
//       }
//       if (!planId) {
//         return res.status(400).json({
//           status: false,
//           message: "planId missing from payment metadata",
//           data: null,
//         });
//       }
//       // Fetch plan to get duration
//       const plan = await prisma.subscriptionPlan.findUnique({
//         where: { id: planId },
//       });
//       if (!plan) {
//         return res.status(400).json({
//           status: false,
//           message: "Invalid planId",
//           data: null,
//         });
//       }
//       const endDate = new Date(now);
//       endDate.setDate(endDate.getDate() + plan.duration);

//       const subscription = await prisma.subscription.create({
//         data: {
//           userId: user.id,
//           planId,
//           status: "active",
//           startDate: now,
//           endDate,
//           paystackSubscriptionId: paystackRes.data.subscription
//             ? paystackRes.data.subscription.toString()
//             : undefined,
//           paystackCustomerId: paystackRes.data.customer
//             ? paystackRes.data.customer.toString()
//             : undefined,
//         },
//       });

//       console.log("Subscription created:");

//       // Update user
//       const updatedUser = await prisma.user.update({
//         where: { id: user.id },
//         data: {
//           isSubscribed: true,
//           subscriptionExpiresAt: endDate,
//         },
//       });

//       if (transaction) {
//         await prisma.transaction.update({
//           where: { id: transaction.id },
//           data: { subscriptionId: subscription.id },
//         });
//         console.log(
//           "Transaction linked to subscription:",
//           transaction.id,
//           "->",
//           subscription.id
//         );
//       }
//     }

//     return res.status(200).json({
//       status: true,
//       message: "Payment verified successfully",
//       data: paystackRes,
//     });
//   } catch (error) {
//     console.error("Paystack verify error:", error);
//     return res.status(500).json({
//       status: false,
//       message: "Failed to verify payment",
//       data: null,
//     });
//   }
// };

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

    // Get the most recent active subscription with plan details
    const currentPlan = await prisma.subscription.findFirst({
      where: {
        userId: req.user!.id,
        status: "active",
        endDate: { gte: new Date() },
      },
      include: {
        plan: true, // Include the plan details
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

export const paystackWebhookHandler = async (req: any, res: Response) => {
  try {
    // Parse the raw body if it's a Buffer
    let rawBody: string;
    let event: any;

    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString("utf8");
      event = JSON.parse(rawBody);
    } else if (typeof req.body === "string") {
      rawBody = req.body;
      event = JSON.parse(rawBody);
    } else if (typeof req.body === "object") {
      rawBody = JSON.stringify(req.body);
      event = req.body;
    } else {
      console.error("Unexpected body type:", typeof req.body);
      return res.status(400).send("Invalid request body");
    }

    // Verify Paystack signature using the raw body
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac("sha512", secret!)
      .update(rawBody)
      .digest("hex");

    if (req.headers["x-paystack-signature"] !== hash) {
      console.error("Invalid signature");
      return res.status(401).send("Invalid signature");
    }
    // Handle different event types
    switch (event.event) {
      case "charge.success":
        return await handleChargeSuccess(event, res);

      case "subscription.create":
        return await handleSubscriptionCreate(event, res);

      case "subscription.disable":
        return await handleSubscriptionDisable(event, res);

      case "invoice.create":
        return await handleInvoiceCreate(event, res);

      case "invoice.payment_failed":
        return await handlePaymentFailed(event, res);

      default:
        console.log(`Unhandled event type: ${event.event}`);
        return res.sendStatus(200);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).send("Internal server error");
  }
};

// Handle successful charge
const handleChargeSuccess = async (event: any, res: Response) => {
  try {
    const {
      reference,
      amount,
      currency,
      customer,
      metadata,
      id: transactionId,
      channel,
      authorization,
    } = event.data;

    const email = customer?.email;
    if (!email) {
      console.error("No customer email found in event data");
      return res.status(400).send("Customer email required");
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User not found for email: ${email}`);
      return res.status(404).send("User not found");
    }

    // Check if transaction already processed (prevent duplicate processing)
    let existingTransaction = await prisma.transaction.findFirst({
      where: {
        paystackReference: reference,
        userId: user.id,
        status: "success",
      },
    });

    if (existingTransaction) {
      console.log("Transaction already processed:", reference);
      return res.sendStatus(200);
    }

    // Create or update transaction
    let transaction = await prisma.transaction.findFirst({
      where: { paystackReference: reference, userId: user.id },
    });

    const transactionData = {
      userId: user.id,
      amount: amount / 100,
      currency: currency || "GHS",
      status: "success",
      paystackReference: reference,
      paystackTransactionId: transactionId?.toString() || reference,
      description: `${
        metadata?.description || "Subscription payment"
      } via webhook`,
      transactionMetadata: JSON.stringify({
        ...event.data,
        webhook_processed_at: new Date().toISOString(),
      }),
    };

    if (!transaction) {
      transaction = await prisma.transaction.create({ data: transactionData });
    } else {
      transaction = await prisma.transaction.update({
        where: { id: transaction.id },
        data: transactionData,
      });
    }

    // Handle subscription
    const planId = Number(metadata?.planId);
    if (!planId) {
      console.error("planId missing from metadata");
      return res.sendStatus(200);
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error(`Invalid planId: ${planId}`);
      return res.status(400).send("Invalid planId");
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.duration);

    // Handle subscription creation/extension
    let subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "active",
        endDate: { gte: now },
      },
      orderBy: { endDate: "desc" },
    });

    if (!subscription) {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId,
          status: "active",
          startDate: now,
          endDate,
          paystackSubscriptionId: metadata?.subscription_id?.toString(),
          paystackCustomerId:
            customer?.customer_code || customer?.id?.toString(),
        },
      });
    } else {
      // Extend existing subscription from current end date
      const newEndDate = new Date(subscription.endDate);
      newEndDate.setDate(newEndDate.getDate() + plan.duration);

      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          endDate: newEndDate,
          planId, // Update plan if different
        },
      });
    }

    // Update user status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isSubscribed: true,
        subscriptionExpiresAt: subscription.endDate,
      },
    });

    // Link transaction to subscription
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { subscriptionId: subscription.id },
    });

    console.log(`Successfully processed payment for user ${user.email}`);
    return res.sendStatus(200);
  } catch (error) {
    console.error("Error in handleChargeSuccess:", error);
    return res.status(500).send("Error processing charge success");
  }
};

// Enhanced verify function that processes payment if webhook hasn't arrived yet
export const verifyPaystackPayment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { reference } = req.body;
    const user = req.user!;

    // Verify with Paystack first
    const paystackRes = await verifyTransaction(reference);

    // Check if our webhook already processed this
    let transaction = await prisma.transaction.findFirst({
      where: {
        paystackReference: reference,
        userId: user.id,
      },
      include: {
        subscription: true,
      },
    });

    // If payment is successful but not processed by webhook yet, process it now
    if (paystackRes.status === "success" && !transaction) {
      console.log(
        "Payment verified but not processed by webhook, processing now..."
      );

      try {
        // Process the payment similar to webhook handler
        const { amount, currency, metadata } = paystackRes.data;

        // Create transaction record
        const newTransaction = await prisma.transaction.create({
          data: {
            userId: user.id,
            amount: amount / 100, // Convert from kobo to GHS
            currency: currency || "GHS",
            status: "success",
            paystackReference: reference,
            paystackTransactionId: paystackRes.data.id?.toString() || reference,
            description: `${
              metadata?.description || "Subscription payment"
            } via verification`,
            transactionMetadata: JSON.stringify({
              ...paystackRes.data,
              processed_via: "verification",
              processed_at: new Date().toISOString(),
            }),
          },
        });

        // Handle subscription creation/extension
        const planId = Number(metadata?.planId);
        if (planId) {
          const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
          });

          if (plan) {
            const now = new Date();
            const endDate = new Date(now);
            endDate.setDate(endDate.getDate() + plan.duration);

            // Check for existing active subscription
            let subscription = await prisma.subscription.findFirst({
              where: {
                userId: user.id,
                status: "active",
                endDate: { gte: now },
              },
              orderBy: { endDate: "desc" },
            });

            if (!subscription) {
              // Create new subscription
              subscription = await prisma.subscription.create({
                data: {
                  userId: user.id,
                  planId,
                  status: "active",
                  startDate: now,
                  endDate,
                  paystackSubscriptionId: metadata?.subscription_id?.toString(),
                  paystackCustomerId:
                    paystackRes.data.customer?.customer_code ||
                    paystackRes.data.customer?.id?.toString(),
                },
              });
            } else {
              // Extend existing subscription
              const newEndDate = new Date(subscription.endDate);
              newEndDate.setDate(newEndDate.getDate() + plan.duration);

              subscription = await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                  endDate: newEndDate,
                  planId,
                },
              });
            }

            // Update user status
            await prisma.user.update({
              where: { id: user.id },
              data: {
                isSubscribed: true,
                subscriptionExpiresAt: subscription.endDate,
              },
            });

            // Link transaction to subscription
            if (newTransaction) {
              await prisma.transaction.update({
                where: { id: newTransaction.id },
                data: { subscriptionId: subscription.id },
              });
            }

            console.log(
              `Successfully processed payment via verification for user ${user.email}`
            );
          }
        }
      } catch (processingError) {
        console.error(
          "Error processing payment via verification:",
          processingError
        );
        // Don't fail the verification, just log the error
      }
    }

    // Re-fetch transaction with subscription data
    const finalTransaction = await prisma.transaction.findFirst({
      where: {
        paystackReference: reference,
        userId: user.id,
      },
      include: {
        subscription: true,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Payment verified and processed",
      data: {
        paystack_status: paystackRes.status,
        transaction_processed: !!finalTransaction,
        subscription_active:
          finalTransaction?.subscription?.status === "active",
        subscription_data: finalTransaction?.subscription,
      },
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
// Handle subscription creation
const handleSubscriptionCreate = async (event: any, res: Response) => {
  const { customer, plan, subscription_code } = event.data;

  console.log("Subscription created:");

  return res.sendStatus(200);
};

// Handle subscription disable
const handleSubscriptionDisable = async (event: any, res: Response) => {
  const { customer, subscription_code } = event.data;

  try {
    // Find and disable subscription
    const user = await prisma.user.findUnique({
      where: { email: customer?.email },
    });

    if (user) {
      await prisma.subscription.updateMany({
        where: {
          userId: user.id,
          paystackSubscriptionId: subscription_code,
        },
        data: { status: "cancelled" },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { isSubscribed: false },
      });

      console.log("Disabled subscription for user:", user.email);
    }
  } catch (error) {
    console.error("Error disabling subscription:", error);
  }

  return res.sendStatus(200);
};

// Handle invoice creation
const handleInvoiceCreate = async (event: any, res: Response) => {
  return res.sendStatus(200);
};

// Handle payment failure
const handlePaymentFailed = async (event: any, res: Response) => {
  const { customer } = event.data;

  console.log("Payment failed for customer:");

  return res.sendStatus(200);
};
