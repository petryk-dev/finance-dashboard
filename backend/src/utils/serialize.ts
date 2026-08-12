import { Prisma, Transaction } from "@prisma/client";

type TransactionWithRelations = Transaction & { [key: string]: unknown };

export function serializeTransaction<T extends TransactionWithRelations>(
  transaction: T
): Omit<T, "amount"> & { amount: number } {
  const amount =
    transaction.amount instanceof Prisma.Decimal
      ? transaction.amount.toNumber()
      : Number(transaction.amount);

  return { ...transaction, amount };
}

export function serializeTransactions<T extends TransactionWithRelations>(
  transactions: T[]
): Array<Omit<T, "amount"> & { amount: number }> {
  return transactions.map(serializeTransaction);
}
