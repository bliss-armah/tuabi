// src/features/auth/authApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";
import {
  LoginFormData,
  LoginResponse,
} from "./types";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginFormData>({
      query: ({ username, password }) => ({
        url: "/login",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, password }).toString(),
      }),
    }),

    // Register
    register: builder.mutation<any, any>({
      query: (data) => ({
        url: "/user/",
        method: "POST",
        body: data,
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<any, void>({
      query: () => ({
        url: "/user/me",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } =
  authApi;
