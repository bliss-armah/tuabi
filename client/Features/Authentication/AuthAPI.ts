import { createApi } from '@reduxjs/toolkit/query/react';
import baseQuery from '@/Shared/Api/config';
import { LoginFormData, LoginResponse, OtpRequestData, OtpResponse, PasswordRequestData } from './types';

export const authApi = createApi({
  reducerPath: 'auhtApi',
  baseQuery,
  endpoints: builder => ({
    login: builder.mutation<LoginResponse, LoginFormData>({
      query: data => ({
        url: '/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: data.username,
          password: data.password,
        }).toString(),
      }),
    }),
    
    verifyOtp: builder.mutation<OtpResponse, OtpRequestData>({
      query: data => ({
        url: '/2fa/confirm/otp',
        method: 'POST',
        body: data,
      }),
    }),
    changePassword: builder.mutation<OtpResponse, PasswordRequestData>({
      query: data => ({
        url: '/2fa/change-password',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useVerifyOtpMutation,
  useChangePasswordMutation,
} = authApi;
