import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery,
  tagTypes: [
    "Subscription",
    "SubscriptionStatus",
    "SubscriptionPlan",
    "Transaction",
  ],
  endpoints: (builder) => ({
    getSubscriptions: builder.query<Subscription[], void>({
      query: () => ({
        url: "/subscriptions",
        method: "GET",
      }),
      providesTags: ["Subscription"],
    }),

    createSubscription: builder.mutation<any, any>({
      query: (data) => ({
        url: "/subscriptions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Subscription", "SubscriptionStatus"],
    }),

    cancelSubscription: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `/subscriptions/${id}`,
        method: "PUT",
        body: { action: "cancel" },
      }),
      invalidatesTags: ["Subscription", "SubscriptionStatus"],
    }),

    initializeSubscriptionPayment: builder.mutation<
      PaystackInitializeResponse,
      PaystackInitializeRequest
    >({
      query: (data) => ({
        url: "/subscriptions/initialize-payment",
        method: "POST",
        body: data,
      }),
    }),

    verifySubscriptionPayment: builder.mutation<
      PaystackVerifyResponse,
      PaystackVerifyRequest
    >({
      query: (data) => ({
        url: "/subscriptions/verify-payment",
        method: "POST",
        body: data,
      }),
      // Invalidate all subscription-related cache after payment verification
      invalidatesTags: ["Subscription", "SubscriptionStatus", "Transaction"],
      // Optimistic update for better UX
      async onQueryStarted({ reference }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Force refetch subscription status immediately
          dispatch(subscriptionApi.util.invalidateTags(["SubscriptionStatus"]));
        } catch (error) {
          console.error("Payment verification failed:", error);
        }
      },
    }),

    getUserTransactions: builder.query<UserTransactionsResponse, void>({
      query: () => ({
        url: "/subscriptions/transactions",
        method: "GET",
      }),
      providesTags: ["Transaction"],
    }),

    getUserSubscriptionStatus: builder.query<UserSubscriptionStatus, void>({
      query: () => ({
        url: "/subscriptions/status",
        method: "GET",
      }),
      providesTags: ["SubscriptionStatus"],
    }),

    getSubscriptionPlans: builder.query<SubscriptionPlanData, void>({
      query: () => ({
        url: "/subscriptions/plans",
        method: "GET",
      }),
      providesTags: ["SubscriptionPlan"],
    }),

    // Add a manual refresh endpoint for immediate status updates
    refreshSubscriptionStatus: builder.mutation<void, void>({
      query: () => ({
        url: "/subscriptions/status",
        method: "GET",
      }),
      invalidatesTags: ["SubscriptionStatus"],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useInitializeSubscriptionPaymentMutation,
  useVerifySubscriptionPaymentMutation,
  useGetUserTransactionsQuery,
  useGetUserSubscriptionStatusQuery,
  useGetSubscriptionPlansQuery,
  useRefreshSubscriptionStatusMutation,
} = subscriptionApi;

// Types
export interface SubscriptionPlan {
  id: number;
  name: string;
  amount: number;
  currency: string;
  duration: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlanData {
  status: boolean;
  message: string;
  data: SubscriptionPlan[];
}

export interface PaystackInitializeRequest {
  email: string;
  amount: number;
  planId: string;
  currency: string;
  callback_url?: string;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    reference: string;
    amount: number;
    currency: string;
    planId: string;
  };
}

export interface PaystackVerifyRequest {
  reference: string;
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: any;
}

export interface Transaction {
  id: number;
  userId: number;
  subscriptionId?: number;
  paystackTransactionId: string;
  paystackReference: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod?: string;
  description?: string;
  transactionMetadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserTransactionsResponse {
  status: boolean;
  message: string;
  data: Transaction[];
}

export interface UserSubscriptionStatus {
  status: boolean;
  message: string;
  data: {
    is_subscribed: boolean;
    subscription_expires_at: string | null;
    current_plan: {
      id: number;
      userId: number;
      planId: number;
      status: string;
      startDate: string;
      endDate: string;
      paystackSubscriptionId?: string;
      paystackCustomerId?: string;
      createdAt: string;
      updatedAt: string;
      plan: SubscriptionPlan;
    } | null;
    active_transactions: Transaction[];
  };
}

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  status: string;
  startDate: string;
  endDate: string;
  paystackSubscriptionId?: string;
  paystackCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
}
