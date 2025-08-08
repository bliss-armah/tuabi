// src/features/auth/authApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";
import { LoginFormData, LoginResponse, RegisterFormData } from "./types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginFormData>({
      query: ({ identifier, password }) => ({
        url: "/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { identifier, password },
      }),
    }),

    // Register
    register: builder.mutation<any, RegisterFormData>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    // Request password reset
    requestPasswordReset: builder.mutation<any, { identifier: string }>({
      query: ({ identifier }) => ({
        url: "/auth/request-reset",
        method: "POST",
        body: { identifier },
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<
      any,
      { identifier: string; resetCode: string; newPassword: string }
    >({
      query: ({ identifier, resetCode, newPassword }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { identifier, resetCode, newPassword },
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<any, void>({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
    }),

    // Add email for Paystack payments
    addEmailForPaystack: builder.mutation<any, { email: string }>({
      query: (data) => ({
        url: "/users/add-email",
        method: "POST",
        body: data,
      }),
    }),

    savePushToken: builder.mutation<any, { pushToken: string }>({
      query: ({ pushToken }) => ({
        url: "/push-token",
        method: "POST",
        body: { pushToken },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useGetCurrentUserQuery,
  useAddEmailForPaystackMutation,
  useSavePushTokenMutation,
} = authApi;
