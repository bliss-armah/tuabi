// src/features/auth/authApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";
import { LoginFormData, LoginResponse, RegisterFormData } from "./types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginFormData>({
      query: ({ phoneNumber, password }) => ({
        url: "/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: { phoneNumber, password },
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
  useGetCurrentUserQuery,
  useAddEmailForPaystackMutation,
  useSavePushTokenMutation,
} = authApi;
