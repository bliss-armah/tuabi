const crypto = require("crypto");
const axios = require("axios");

// Test webhook endpoint
const WEBHOOK_URL =
  process.env.WEBHOOK_URL ||
  "http://localhost:3000/api/subscriptions/webhook/paystack";
const SECRET_KEY =
  process.env.PAYSTACK_SECRET_KEY ||
  "sk_test_70c6c775e0169588132b6c504761debcf85a6a1d";

// Sample webhook payload (charge.success event)
const webhookPayload = {
  event: "charge.success",
  data: {
    id: 123456789,
    domain: "test",
    amount: 50000, // 500 GHS in kobo
    currency: "GHS",
    status: "success",
    reference: "TEST_REF_" + Date.now(),
    receipt_number: null,
    message: null,
    gateway_response: "Successful",
    paid_at: new Date().toISOString(),
    channel: "card",
    ip_address: "127.0.0.1",
    metadata: {
      planId: "1",
      userId: "1",
      planName: "Monthly Plan",
      description: "Monthly Plan subscription payment",
    },
    customer: {
      id: 123456,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      customer_code: "CUS_" + Date.now(),
      phone: null,
      metadata: null,
      risk_action: "default",
    },
    authorization: {
      authorization_code: "AUTH_" + Date.now(),
      bin: "408408",
      last4: "4081",
      exp_month: "12",
      exp_year: "2025",
      channel: "card",
      card_type: "visa",
      bank: "TEST BANK",
      country_code: "NG",
      brand: "visa",
      reusable: true,
      signature: "SIG_" + Date.now(),
    },
    plan: null,
    subaccount: {},
    split: {},
    order_id: null,
    paidAt: new Date().toISOString(),
    requested_amount: 50000,
    pos_transaction_data: null,
    source: null,
    fees_breakdown: null,
    transaction_date: new Date().toISOString(),
    plan_object: {},
    subaccount_object: {},
  },
};

// Create signature
const rawBody = JSON.stringify(webhookPayload);
const hash = crypto
  .createHmac("sha512", SECRET_KEY)
  .update(rawBody)
  .digest("hex");

async function testWebhook() {
  try {
    console.log("🧪 Testing webhook endpoint...");
    console.log("📡 URL:", WEBHOOK_URL);
    console.log("🔑 Secret Key:", SECRET_KEY.substring(0, 15) + "...");
    console.log("📝 Payload:", JSON.stringify(webhookPayload, null, 2));
    console.log("🔐 Signature:", hash);

    const response = await axios.post(WEBHOOK_URL, rawBody, {
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": hash,
        "User-Agent": "Paystack-Webhook-Test/1.0",
      },
      timeout: 10000,
    });

    console.log("✅ Webhook test successful!");
    console.log("📊 Status:", response.status);
    console.log("📄 Response:", response.data);
  } catch (error) {
    console.error("❌ Webhook test failed!");
    console.error("🚨 Error:", error.message);

    if (error.response) {
      console.error("📊 Status:", error.response.status);
      console.error("📄 Response:", error.response.data);
    }

    process.exit(1);
  }
}

// Run test
if (require.main === module) {
  testWebhook();
}

module.exports = { testWebhook, webhookPayload, hash };
