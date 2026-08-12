import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().trim().min(1, "Description is required").max(255),
  date: z.coerce.date(),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().uuid("Invalid category id"),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
