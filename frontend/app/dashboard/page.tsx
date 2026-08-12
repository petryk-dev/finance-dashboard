"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Header } from "@/components/ui/Header";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { LineChart } from "@/components/charts/LineChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { CategoryBreakdown, MonthlyData, SummaryData, Transaction } from "@/lib/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);
  const [byCategory, setByCategory] = useState<CategoryBreakdown[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      const [summaryRes, monthlyRes, byCategoryRes, recentRes] = await Promise.all([
        api.get<SummaryData>("/analytics/summary"),
        api.get<MonthlyData[]>("/analytics/monthly"),
        api.get<CategoryBreakdown[]>("/analytics/by-category"),
        api.get<Transaction[]>("/analytics/recent"),
      ]);
      setSummary(summaryRes.data);
      setMonthly(monthlyRes.data);
      setByCategory(byCategoryRes.data);
      setRecent(recentRes.data);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Dashboard"
        subtitle={summary ? `${summary.month} ${summary.year}` : undefined}
      />

      <div className="flex-1 space-y-6 p-6 md:p-8">
        {loading || !summary ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard icon={TrendingUp} label="Total Income" amount={summary.totalIncome} variant="income" />
              <SummaryCard icon={TrendingDown} label="Total Expenses" amount={summary.totalExpense} variant="expense" />
              <SummaryCard icon={Wallet} label="Balance" amount={summary.balance} variant="balance" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <div className="rounded-xl border border-border bg-card p-5 lg:col-span-3">
                <h2 className="mb-2 text-sm font-semibold text-zinc-100">Income vs Expenses</h2>
                <p className="mb-4 text-xs text-muted">Last 6 months</p>
                <LineChart data={monthly} />
              </div>

              <div className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
                <h2 className="mb-2 text-sm font-semibold text-zinc-100">Expenses by Category</h2>
                <p className="mb-4 text-xs text-muted">Current month</p>
                <DonutChart data={byCategory} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-zinc-100">Recent Transactions</h2>
              {recent.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">No transactions yet</p>
              ) : (
                <ul className="divide-y divide-border">
                  {recent.map((transaction) => (
                    <li key={transaction.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-3">
                        <CategoryBadge category={transaction.category} />
                        <div>
                          <p className="text-sm text-zinc-100">{transaction.description}</p>
                          <p className="text-xs text-muted">{formatDate(transaction.date)}</p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          transaction.type === "INCOME" ? "text-income" : "text-expense"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
