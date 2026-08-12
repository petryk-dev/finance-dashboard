"use client";

import { Trash2 } from "lucide-react";
import clsx from "clsx";
import type { Transaction } from "@/lib/types";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { formatCurrency, formatDate } from "@/lib/format";

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  deleting?: boolean;
}

export function TransactionRow({ transaction, onDelete, deleting }: TransactionRowProps) {
  const isIncome = transaction.type === "INCOME";

  return (
    <tr className="border-b border-border last:border-0 hover:bg-zinc-900/40">
      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted">{formatDate(transaction.date)}</td>
      <td className="px-4 py-3 text-sm text-zinc-100">{transaction.description}</td>
      <td className="px-4 py-3">
        <CategoryBadge category={transaction.category} />
      </td>
      <td
        className={clsx(
          "whitespace-nowrap px-4 py-3 text-right text-sm font-semibold",
          isIncome ? "text-income" : "text-expense"
        )}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onDelete(transaction.id)}
          disabled={deleting}
          aria-label="Delete transaction"
          className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-expense/10 hover:text-expense disabled:opacity-40"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}
