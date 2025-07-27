# Paystack Integration Guide

This guide covers the complete Paystack subscription integration in the Tuabi app, including the popup implementation and webhook handling for seamless UI updates.

## 🏗️ Architecture Overview

### Frontend (React Native)

- **Paystack Popup**: Uses `react-native-paystack-webview` for in-app payments
- **State Management**: RTK Query for API calls and cache management
- **Real-time Updates**: Automatic cache invalidation and polling

### Backend (Node.js/Express)

- **Webhook Handler**: Processes Paystack webhooks for payment verification
- **Database**: Prisma with PostgreSQL for subscription and transaction tracking
- **Security**: HMAC signature verification for webhook authenticity

## 📱 Frontend Implementation

### 1. Subscription Plans Screen (`client/app/subscription-plans.tsx`)

The main subscription flow:

```typescript
// Key components
const { popup } = usePaystack();
const [initializePayment] = useInitializeSubscriptionPaymentMutation();
const [verifyPayment] = useVerifySubscriptionPaymentMutation();

// Payment flow
const handleSubscribe = async () => {
  // 1. Initialize payment with backend
  const response = await initializePayment({
    email: user.email,
    amount: selectedPlan.amount,
    planId: selectedPlan.id.toString(),
    currency: "GHS",
  });

  // 2. Open Paystack popup
  popup.checkout({
    email: user.email,
    amount: selectedPlan.amount,
    reference: response.data.reference,
    metadata: {
      planId: selectedPlan.id.toString(),
      userId: user.id?.toString(),
      planName: selectedPlan.name,
    },
    onSuccess: async (transaction) => {
      await handlePaymentSuccess(transaction.reference);
    },
    onCancel: () => {
      // Handle cancellation
    },
    onError: (error) => {
      // Handle errors
    },
  });
};
```

### 2. Subscription API (`client/Features/Subscription/SubscriptionAPI.ts`)

RTK Query setup with cache invalidation:

```typescript
export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api",
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as any;
      const token = state?.auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Subscription",
    "SubscriptionStatus",
    "SubscriptionPlan",
    "Transaction",
  ],
  endpoints: (builder) => ({
    // Payment verification with cache invalidation
    verifySubscriptionPayment: builder.mutation({
      query: (data) => ({
        url: "/subscriptions/verify-payment",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription", "SubscriptionStatus", "Transaction"],
      async onQueryStarted({ reference }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(subscriptionApi.util.invalidateTags(["SubscriptionStatus"]));
        } catch (error) {
          console.error("Payment verification failed:", error);
        }
      },
    }),
  }),
});
```

### 3. Subscription Status Component (`client/Features/Subscription/SubscriptionStatus.tsx`)

Real-time subscription status display:

```typescript
export default function SubscriptionStatus() {
  const { data: subscriptionResponse, refetch } =
    useGetUserSubscriptionStatusQuery(undefined, {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    });

  // Auto-refresh on component mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Display subscription status with real-time updates
}
```

## 🔧 Backend Implementation

### 1. Webhook Handler (`server/src/controllers/subscriptionController.ts`)

Comprehensive webhook processing:

```typescript
export const paystackWebhookHandler = async (req: any, res: Response) => {
  try {
    // Parse raw body for signature verification
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
    }

    // Verify Paystack signature
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
      default:
        console.log(`Unhandled event type: ${event.event}`);
        return res.sendStatus(200);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).send("Internal server error");
  }
};
```

### 2. Charge Success Handler

Processes successful payments:

```typescript
const handleChargeSuccess = async (event: any, res: Response) => {
  try {
    const {
      reference,
      amount,
      currency,
      customer,
      metadata,
      id: transactionId,
    } = event.data;
    const email = customer?.email;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`User not found for email: ${email}`);
      return res.status(404).send("User not found");
    }

    // Check for duplicate processing
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

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
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
      },
    });

    // Handle subscription creation/extension
    const planId = Number(metadata?.planId);
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + plan.duration);

    // Create or extend subscription
    let subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "active",
        endDate: { gte: now },
      },
    });

    if (!subscription) {
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
```

### 3. Routes Configuration (`server/src/routes/subscription.ts`)

```typescript
const router = Router();

// Webhook route - NO authentication required (Paystack calls this directly)
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
```

## 🔐 Environment Configuration

### Required Environment Variables

```bash
# Backend (.env)
PAYSTACK_SECRET_KEY=sk_test_70c6c775e0169588132b6c504761debcf85a6a1d
PAYSTACK_PUBLIC_KEY=pk_test_70c6c775e0169588132b6c504761debcf85a6a1d
FRONTEND_URL=http://localhost:3000

# Frontend (app.config.js or .env)
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Paystack Dashboard Configuration

1. **Webhook URL**: `https://your-domain.com/api/subscriptions/webhook/paystack`
2. **Events to Listen For**:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`
   - `invoice.create`
   - `invoice.payment_failed`

## 🚀 Deployment Checklist

### Backend Deployment

- [ ] Set `PAYSTACK_SECRET_KEY` environment variable
- [ ] Configure webhook URL in Paystack dashboard
- [ ] Ensure webhook endpoint is publicly accessible
- [ ] Test webhook signature verification
- [ ] Monitor webhook logs for errors

### Frontend Deployment

- [ ] Set `EXPO_PUBLIC_API_URL` to production API URL
- [ ] Test Paystack popup in production environment
- [ ] Verify payment flow end-to-end
- [ ] Test subscription status updates

### Database Migration

- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Verify subscription and transaction tables exist
- [ ] Check database indexes for performance

## 🔍 Monitoring and Debugging

### Webhook Monitoring

```typescript
// Add to webhook handler for debugging
console.log("Webhook received:", {
  event: event.event,
  reference: event.data?.reference,
  amount: event.data?.amount,
  customer: event.data?.customer?.email,
  timestamp: new Date().toISOString(),
});
```

### Frontend Debugging

```typescript
// Add to payment success handler
console.log("Payment successful:", {
  reference: transaction.reference,
  amount: transaction.amount,
  status: transaction.status,
});
```

### Database Queries for Monitoring

```sql
-- Check recent transactions
SELECT * FROM transactions
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Check active subscriptions
SELECT u.email, s.status, s.end_date, p.name as plan_name
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN subscription_plans p ON s.plan_id = p.id
WHERE s.status = 'active' AND s.end_date > NOW();
```

## 🛠️ Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**

   - Check webhook URL is correct in Paystack dashboard
   - Verify server is publicly accessible
   - Check firewall/security group settings

2. **Signature Verification Failing**

   - Ensure `PAYSTACK_SECRET_KEY` is correct
   - Verify raw body parsing is enabled
   - Check webhook signature header

3. **UI Not Updating After Payment**

   - Check cache invalidation is working
   - Verify subscription status query is refetching
   - Check for network errors in browser console

4. **Payment Popup Not Opening**
   - Verify Paystack public key is correct
   - Check network connectivity
   - Ensure popup is not blocked by browser

### Debug Commands

```bash
# Check webhook logs
docker logs -f tuabi-server

# Test webhook endpoint
curl -X POST https://your-domain.com/api/subscriptions/webhook/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test" \
  -d '{"event":"test","data":{}}'

# Check database
docker exec -it tuabi-db psql -U postgres -d tuabi -c "SELECT * FROM transactions LIMIT 5;"
```

## 📈 Performance Optimization

### Frontend Optimizations

- Use RTK Query caching for subscription status
- Implement optimistic updates for better UX
- Add retry logic for failed API calls

### Backend Optimizations

- Add database indexes for frequent queries
- Implement webhook idempotency
- Use connection pooling for database

### Monitoring

- Set up alerts for webhook failures
- Monitor payment success rates
- Track subscription conversion rates

## 🔄 Maintenance

### Regular Tasks

- [ ] Monitor webhook logs daily
- [ ] Check payment success rates weekly
- [ ] Review subscription analytics monthly
- [ ] Update Paystack SDK versions quarterly

### Security Updates

- [ ] Rotate Paystack keys annually
- [ ] Review webhook signature verification
- [ ] Audit database access logs
- [ ] Update dependencies regularly

This guide ensures your Paystack integration remains robust and provides seamless user experience with real-time updates.
