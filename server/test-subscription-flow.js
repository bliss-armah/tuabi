const axios = require("axios");

// Test subscription flow
const API_URL = process.env.API_URL || "http://localhost:3000/api";
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "password123";

async function testSubscriptionFlow() {
  try {
    console.log("🧪 Testing complete subscription flow...");

    // Step 1: Login to get token
    console.log("\n1️⃣ Logging in...");
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    const token = loginResponse.data.data.token;
    console.log("✅ Login successful");

    // Step 2: Get subscription plans
    console.log("\n2️⃣ Getting subscription plans...");
    const plansResponse = await axios.get(`${API_URL}/subscriptions/plans`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const plans = plansResponse.data.data;
    console.log(
      `✅ Found ${plans.length} plans:`,
      plans.map((p) => p.name)
    );

    // Step 3: Check current subscription status
    console.log("\n3️⃣ Checking current subscription status...");
    const statusResponse = await axios.get(`${API_URL}/subscriptions/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const currentStatus = statusResponse.data.data;
    console.log("Current subscription status:", {
      is_subscribed: currentStatus.is_subscribed,
      expires_at: currentStatus.subscription_expires_at,
      current_plan: currentStatus.current_plan?.plan?.name || "None",
    });

    // Step 4: Get user transactions
    console.log("\n4️⃣ Getting user transactions...");
    const transactionsResponse = await axios.get(
      `${API_URL}/subscriptions/transactions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const transactions = transactionsResponse.data.data;
    console.log(`✅ Found ${transactions.length} transactions`);

    // Step 5: Test webhook processing (simulate successful payment)
    console.log("\n5️⃣ Testing webhook processing...");
    const testReference = `TEST_REF_${Date.now()}`;

    // Simulate webhook payload
    const webhookPayload = {
      event: "charge.success",
      data: {
        id: 123456789,
        amount: 50000, // 500 GHS in kobo
        currency: "GHS",
        status: "success",
        reference: testReference,
        metadata: {
          planId: "1",
          userId: "1",
          planName: "Monthly Plan",
          description: "Monthly Plan subscription payment",
        },
        customer: {
          id: 123456,
          email: TEST_EMAIL,
          customer_code: `CUS_${Date.now()}`,
        },
        authorization: {
          authorization_code: `AUTH_${Date.now()}`,
          channel: "card",
          card_type: "visa",
        },
      },
    };

    // Send webhook
    const webhookResponse = await axios.post(
      `${API_URL}/subscriptions/webhook/paystack`,
      webhookPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-paystack-signature": "test-signature", // This will fail verification but we can see the processing
        },
      }
    );

    console.log("Webhook response status:", webhookResponse.status);

    // Step 6: Check subscription status after webhook
    console.log("\n6️⃣ Checking subscription status after webhook...");
    const newStatusResponse = await axios.get(
      `${API_URL}/subscriptions/status`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const newStatus = newStatusResponse.data.data;
    console.log("New subscription status:", {
      is_subscribed: newStatus.is_subscribed,
      expires_at: newStatus.subscription_expires_at,
      current_plan: newStatus.current_plan?.plan?.name || "None",
    });

    // Step 7: Test payment verification
    console.log("\n7️⃣ Testing payment verification...");
    const verifyResponse = await axios.post(
      `${API_URL}/subscriptions/verify-payment`,
      {
        reference: testReference,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Verification response:", verifyResponse.data);

    console.log("\n✅ Subscription flow test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

// Run test
if (require.main === module) {
  testSubscriptionFlow();
}

module.exports = { testSubscriptionFlow };
