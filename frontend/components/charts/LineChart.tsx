"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyData } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface LineChartProps {
  data: MonthlyData[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-[#1f1f1f] px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-muted">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-300">{entry.name}</span>
          <span className="ml-auto font-medium text-zinc-100">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function LineChart({ data }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsLineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
        <XAxis
          dataKey="month"
          stroke="#71717a"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          tickLine={false}
          axisLine={{ stroke: "#27272a" }}
        />
        <YAxis
          stroke="#71717a"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `$${value >= 1000 ? `${Math.round(value / 1000)}k` : value}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3f3f46", strokeWidth: 1 }} />
        <Legend
          verticalAlign="top"
          align="right"
          height={32}
          iconType="circle"
          wrapperStyle={{ fontSize: 13, color: "#a1a1aa" }}
        />
        <Line
          type="monotone"
          dataKey="income"
          name="Income"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ r: 3, fill: "#22c55e", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Expense"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
