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
  tagTypes: ["Debtor", "Debtors", "Dashboard"],
  endpoints: (builder) => ({
    getDebtors: builder.query<any, void>({
      query: () => "/debtors/",
      providesTags: ["Debtors"],
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
      invalidatesTags: ["Debtors"],
    }),

    getDebtorHistory: builder.query<any, number>({
      query: (id) => `/debt-history/debtor/${id}`,
    }),
    updateDebtor: builder.mutation<any, { id: number; data: Partial<Debtor> }>({
      query: ({ id, data }) => ({
        url: `/debtors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Debtors", "Debtor"],
    }),
    getDashboardSummary: builder.query<any, void>({
      query: () => "/debtors/dashboard",
      providesTags: ["Dashboard"],
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
      invalidatesTags: ["Debtors", "Dashboard"],
    }),
  }),
});

export const {
  useGetDebtorsQuery,
  useGetDebtorQuery,
  useCreateDebtorMutation,
  useGetDebtorHistoryQuery,
  useAddPaymentMutation,
  useUpdateDebtorMutation,
  useGetDashboardSummaryQuery,
} = debtorApi;
