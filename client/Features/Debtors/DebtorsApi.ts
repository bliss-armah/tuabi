import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";

export const debtorApi = createApi({
  reducerPath: "debtorApi",
  baseQuery,
  tagTypes: ["Debtor"],
  endpoints: (builder) => ({
    getDebtors: builder.query<any[], void>({
      query: () => "/debtors/",
      providesTags: ["Debtor"],
    }),

    getDebtor: builder.query<any, number>({
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
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const response = await baseQuery("/debtors/");
        if ("error" in response) return { error: response.error };
    
        const debtors = Array.isArray(response.data) ? response.data : [];
        const totalDebtors = debtors.length;
        const totalDebt = debtors.reduce(
          (sum, d) => sum + (d.amount_owed || 0),
          0
        );
    
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
        const recentActivities = debtors.filter(
          (d) => new Date(d.updated_at) >= sevenDaysAgo
        ).length;
    
        return {
          data: { totalDebtors, totalDebt, recentActivities },
        };
      },
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
