"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/ui/Header";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";
import { api } from "@/lib/api";
import type { Category, Pagination, Transaction, TransactionType } from "@/lib/types";

interface Filters {
  type: TransactionType | "";
  categoryId: string;
  startDate: string;
  endDate: string;
}

const emptyFilters: Filters = { type: "", categoryId: "", startDate: "", endDate: "" };

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    const res = await api.get<Transaction[]>("/transactions", {
      type: filters.type || undefined,
      categoryId: filters.categoryId || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      page,
      limit: 10,
    });
    setTransactions(res.data);
    setPagination(res.pagination ?? null);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    api.get<Category[]>("/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleFilterChange = (patch: Partial<Filters>) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/transactions/${id}`);
      await loadTransactions();
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = () => {
    setPage(1);
    loadTransactions();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Transactions" subtitle="Manage your income and expenses" />

      <div className="flex-1 space-y-6 p-6 md:p-8">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="grid flex-1 grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Select
              label="Type"
              value={filters.type}
              onChange={(e) => handleFilterChange({ type: e.target.value as TransactionType | "" })}
              className="sm:w-36"
            >
              <option value="">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </Select>

            <Select
              label="Category"
              value={filters.categoryId}
              onChange={(e) => handleFilterChange({ categoryId: e.target.value })}
              className="sm:w-44"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </Select>

            <Input
              label="From"
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange({ startDate: e.target.value })}
              className="sm:w-40"
            />
            <Input
              label="To"
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange({ endDate: e.target.value })}
              className="sm:w-40"
            />
          </div>

          <Button onClick={() => setModalOpen(true)} className="shrink-0">
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onDelete={handleDelete}
                      deleting={deletingId === transaction.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-xs text-muted">
                Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft size={15} />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
        onCreated={handleCreated}
      />
    </div>
  );
}
