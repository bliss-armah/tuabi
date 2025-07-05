import { z } from "zod";

export const debtorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Amount must be a valid number",
    })
    .optional(), // Only required in 'add' mode — we’ll handle that in the form
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]+$/, "Phone number must be digits only"),
  description: z.string().max(250, "Max 250 characters").optional(),
  note: z.string().max(250, "Max 250 characters").optional(),
});
