import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "@/Shared/Api/config";


export interface Reminder {
  id: number;
  debtorId: number;
  userId: number;
  title: string;
  message: string;
  dueDate: string;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  debtor: {
    id: number;
    name: string;
    amountOwed: number;
    phoneNumber?: string;
  };
}

export interface CreateReminderRequest {
  debtorId: number;
  title: string;
  message: string;
  dueDate: string;
}

export interface UpdateReminderRequest {
  title?: string;
  message?: string;
  dueDate?: string;
  isCompleted?: boolean;
  isActive?: boolean;
}

export interface ReminderResponse {
  success: boolean;
  message: string;
  data: Reminder;
}

export interface RemindersResponse {
  success: boolean;
  data: Reminder[];
}

export const remindersApi = createApi({
  reducerPath: "remindersApi",
  baseQuery,
  tagTypes: ["Reminder", "Reminders"],
  endpoints: (builder) => ({
    getReminders: builder.query<
      RemindersResponse,
      { debtorId?: number; status?: string }
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params.debtorId)
          searchParams.append("debtorId", params.debtorId.toString());
        if (params.status) searchParams.append("status", params.status);
        return `/reminders/?${searchParams.toString()}`;
      },
      providesTags: ["Reminders"],
    }),

    getReminder: builder.query<ReminderResponse, number>({
      query: (id) => `/reminders/${id}`,
      providesTags: ["Reminder"],
    }),

    getOverdueReminders: builder.query<RemindersResponse, void>({
      query: () => "/reminders/overdue",
      providesTags: ["Reminders"],
    }),

    createReminder: builder.mutation<ReminderResponse, CreateReminderRequest>({
      query: (reminder) => ({
        url: "/reminders/",
        method: "POST",
        body: reminder,
      }),
      invalidatesTags: ["Reminders"],
    }),

    updateReminder: builder.mutation<
      ReminderResponse,
      { id: number; data: UpdateReminderRequest }
    >({
      query: ({ id, data }) => ({
        url: `/reminders/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Reminders", "Reminder"],
    }),

    deleteReminder: builder.mutation<any, number>({
      query: (id) => ({
        url: `/reminders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reminders"],
    }),

    markReminderAsCompleted: builder.mutation<ReminderResponse, number>({
      query: (id) => ({
        url: `/reminders/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Reminders", "Reminder"],
    }),
  }),
});

export const {
  useGetRemindersQuery,
  useGetReminderQuery,
  useGetOverdueRemindersQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
  useMarkReminderAsCompletedMutation,
} = remindersApi;
