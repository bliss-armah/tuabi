import axios, { AxiosResponse } from "axios";

// Validate environment variable
if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error(
    "PAYSTACK_SECRET_KEY is not defined in environment variables"
  );
}

if (!process.env.PAYSTACK_SECRET_KEY.startsWith("sk_")) {
  throw new Error("PAYSTACK_SECRET_KEY must start with sk_test_ or sk_live_");
}

console.log(
  "Paystack initialized with key:",
  process.env.PAYSTACK_SECRET_KEY.substring(0, 15) + "..."
);

const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Create axios instance with default headers
const paystackApi = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor for debugging
paystackApi.interceptors.request.use(
  (config) => {
    console.log("Paystack API Request:", {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization:
          config.headers.Authorization?.toString().substring(0, 20) + "...",
      },
    });
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
paystackApi.interceptors.response.use(
  (response) => {
    console.log("Paystack API Response:", response.status, response.statusText);
    return response;
  },
  (error) => {
    console.error("Paystack API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const initializeTransaction = async (
  email: string,
  amount: number,
  metadata: any = {}
) => {
  try {
    console.log("Initializing transaction:", {
      email,
      amount: amount * 100,
      metadata,
    });

    const requestData = {
      email,
      amount: amount * 100, // Convert to kobo/pesewas
      metadata,
      callback_url: process.env.FRONTEND_URL || "http://localhost:3000",
      currency: "GHS",
    };

    const response: AxiosResponse = await paystackApi.post(
      "/transaction/initialize",
      requestData
    );

    console.log("Transaction initialized successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Paystack initialization error:", error);

    // Handle Axios errors
    if (error.response) {
      const { status, data } = error.response;
      console.error("Paystack API Error Response:", { status, data });

      if (status === 401) {
        throw new Error(
          "Invalid Paystack secret key. Please check your environment variables."
        );
      }

      throw new Error(
        `Payment initialization failed: ${data.message || error.message}`
      );
    }

    if (error.request) {
      throw new Error("Network error: Unable to reach Paystack API");
    }

    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

export const verifyTransaction = async (reference: string) => {
  try {
    console.log("Verifying transaction:", reference);

    const response: AxiosResponse = await paystackApi.get(
      `/transaction/verify/${reference}`
    );

    console.log("Transaction verified:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Paystack verification error:", error);

    if (error.response) {
      const { status, data } = error.response;
      throw new Error(
        `Payment verification failed: ${data.message || error.message}`
      );
    }

    if (error.request) {
      throw new Error("Network error: Unable to reach Paystack API");
    }

    throw new Error(`Payment verification failed: ${error.message}`);
  }
};
