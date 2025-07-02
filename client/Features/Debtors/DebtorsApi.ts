import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";

export interface DebtHistory {
  id: number;
  amountChanged: number;
  note: string | null;
  timestamp: string;
  action: string;
}

export interface Debtor {
  id: number;
  name: string;
  amountOwed: number;
  description: string;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string | null;
  history: DebtHistory[];
}

export interface DebtorResponse {
  data: Debtor;
}

export const debtorApi = createApi({
  reducerPath: "debtorApi",
  baseQuery,
  tagTypes: ["Debtor"],
  endpoints: (builder) => ({
    getDebtors: builder.query<any, void>({
      query: () => "/debtors/",
      providesTags: ["Debtor"],
    }),

    getDebtor: builder.query<DebtorResponse, number>({
      query: (id) => `/debtors/${id}`,
      providesTags: ["Debtor"],
    }),

    createDebtor: builder.mutation<any, any>({
      query: (debtor) => ({
        url: "/debtors/",
        method: "POST",
        body: debtor,
      }),
      invalidatesTags: ["Debtor"],
    }),

    updateDebtor: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/debtors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Debtor"],
    }),

    deleteDebtor: builder.mutation<any, number>({
      query: (id) => ({
        url: `/debtors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Debtor"],
    }),

    getDebtorHistory: builder.query<any, number>({
      query: (id) => `/debt-history/${id}`,
      providesTags: ["Debtor"],
    }),

    addPayment: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/debt-history/${id}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Debtor"],
    }),

    getDashboardSummary: builder.query<any, void>({
      query: () => "/debtors/dashboard",
    }),
  }),
});

export const {
  useGetDebtorsQuery,
  useGetDebtorQuery,
  useCreateDebtorMutation,
  useUpdateDebtorMutation,
  useDeleteDebtorMutation,
  useGetDebtorHistoryQuery,
  useAddPaymentMutation,
  useGetDashboardSummaryQuery,
} = debtorApi;
