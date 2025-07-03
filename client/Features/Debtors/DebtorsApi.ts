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
    }),

    createDebtor: builder.mutation<any, any>({
      query: (debtor) => ({
        url: "/debtors/",
        method: "POST",
        body: debtor,
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
      query: (id) => `/debt-history/debtor/${id}`,
    }),

    addPayment: builder.mutation<
      any,
      {
        id: number;
        data: {
          amount: number;
          note?: string;
          action: "add" | "reduce" | "settled";
        };
      }
    >({
      query: ({ id, data }) => ({
        url:
          data.action === "add"
            ? `/debtors/${id}/increment`
            : `/debtors/${id}/decrement`,
        method: "PATCH",
        body: { amount: Math.abs(data.amount), note: data.note },
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
  useDeleteDebtorMutation,
  useGetDebtorHistoryQuery,
  useAddPaymentMutation,
  useGetDashboardSummaryQuery,
} = debtorApi;
