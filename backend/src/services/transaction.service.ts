import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { NotFoundError } from "../utils/AppError";
import { serializeTransaction, serializeTransactions } from "../utils/serialize";
import type {
  CreateTransactionInput,
  TransactionQuery,
  UpdateTransactionInput,
} from "../validators/transaction.validators";

export async function listTransactions(userId: string, query: TransactionQuery) {
  const where: Prisma.TransactionWhereInput = { userId };

  if (query.type) {
    where.type = query.type;
  }
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  if (query.startDate || query.endDate) {
    where.date = {
      ...(query.startDate ? { gte: query.startDate } : {}),
      ...(query.endDate ? { lte: query.endDate } : {}),
    };
  }

  const skip = (query.page - 1) * query.limit;

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: serializeTransactions(transactions),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

async function assertCategoryOwnership(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  return category;
}

async function assertTransactionOwnership(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });
  if (!transaction) {
    throw new NotFoundError("Transaction not found");
  }
  return transaction;
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  await assertCategoryOwnership(userId, input.categoryId);

  const transaction = await prisma.transaction.create({
    data: { ...input, userId },
    include: { category: true },
  });

  return serializeTransaction(transaction);
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  input: UpdateTransactionInput
) {
  await assertTransactionOwnership(userId, transactionId);

  if (input.categoryId) {
    await assertCategoryOwnership(userId, input.categoryId);
  }

  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: input,
    include: { category: true },
  });

  return serializeTransaction(transaction);
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  await assertTransactionOwnership(userId, transactionId);
  await prisma.transaction.delete({ where: { id: transactionId } });
}
