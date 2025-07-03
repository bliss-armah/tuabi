import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";

// Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
  description?: string;
}

export interface PaystackInitializeRequest {
  email: string;
  amount: number;
  plan_type: string;
  currency: string;
  callback_url?: string;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
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
  user_id: number;
  subscription_id?: number;
  paystack_transaction_id: string;
  paystack_reference: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  description?: string;
  transaction_metadata?: string;
  created_at: string;
  updated_at?: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_type: string;
  amount: number;
  currency: string;
  status: string;
  start_date: string;
  end_date: string;
  paystack_subscription_id?: string;
  paystack_customer_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserSubscriptionStatus {
  is_subscribed: boolean;
  subscription_expires_at?: string;
  current_plan?: Subscription;
  active_transactions: Transaction[];
}

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery,
  endpoints: (builder) => ({
    getSubscriptions: builder.query<Subscription[], void>({
      query: () => ({
        url: "/subscriptions",
        method: "GET",
      }),
    }),
    createSubscription: builder.mutation<any, any>({
      query: (data) => ({
        url: "/subscriptions",
        method: "POST",
        body: data,
      }),
    }),
    cancelSubscription: builder.mutation<any, { id: number }>({
      query: ({ id }) => ({
        url: `/subscriptions/${id}/cancel`,
        method: "PUT",
      }),
    }),
    // Commented out endpoints that do not exist in backend
    // getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
    //   query: () => ({
    //     url: "/subscription/plans",
    //     method: "GET",
    //   }),
    // }),
    // initializeSubscriptionPayment: builder.mutation<
    //   PaystackInitializeResponse,
    //   PaystackInitializeRequest
    // >({
    //   query: (data) => ({
    //     url: "/subscription/initialize",
    //     method: "POST",
    //     body: data,
    //   }),
    // }),
    // verifySubscriptionPayment: builder.mutation<
    //   PaystackVerifyResponse,
    //   PaystackVerifyRequest
    // >({
    //   query: (data) => ({
    //     url: "/subscription/verify",
    //     method: "POST",
    //     body: data,
    //   }),
    // }),
    // getUserSubscriptionStatus: builder.query<UserSubscriptionStatus, void>({
    //   query: () => ({
    //     url: "/subscription/status",
    //     method: "GET",
    //   }),
    // }),
    // getUserTransactions: builder.query<Transaction[], void>({
    //   query: () => ({
    //     url: "/subscription/transactions",
    //     method: "GET",
    //   }),
    // }),
    // getUserSubscriptions: builder.query<Subscription[], void>({
    //   query: () => ({
    //     url: "/subscription/subscriptions",
    //     method: "GET",
    //   }),
    // }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;
