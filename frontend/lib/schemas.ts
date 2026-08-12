import { z } from "zod";

export const transactionFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().trim().min(1, "Description is required").max(255),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().uuid("Please select a category"),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
