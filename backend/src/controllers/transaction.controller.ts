import { Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middleware/auth";
import {
  createTransactionSchema,
  transactionQuerySchema,
  updateTransactionSchema,
} from "../validators/transaction.validators";
import * as transactionService from "../services/transaction.service";
import { UnauthorizedError } from "../utils/AppError";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.id;
}

export const list = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const query = transactionQuerySchema.parse(req.query);
  const result = await transactionService.listTransactions(userId, query);
  res.status(200).json({ success: true, data: result.transactions, pagination: result.pagination });
});

export const create = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const input = createTransactionSchema.parse(req.body);
  const transaction = await transactionService.createTransaction(userId, input);
  res.status(201).json({ success: true, data: transaction });
});

export const update = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const input = updateTransactionSchema.parse(req.body);
  const transaction = await transactionService.updateTransaction(userId, req.params.id, input);
  res.status(200).json({ success: true, data: transaction });
});

export const remove = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  await transactionService.deleteTransaction(userId, req.params.id);
  res.status(200).json({ success: true, message: "Transaction deleted" });
});
