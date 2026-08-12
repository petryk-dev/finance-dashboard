"use client";

import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryBreakdown } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

interface DonutChartProps {
  data: CategoryBreakdown[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CategoryBreakdown }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-[#1f1f1f] px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 text-sm">
        <span aria-hidden>{item.icon}</span>
        <span className="text-zinc-300">{item.name}</span>
      </div>
      <p className="mt-1 text-sm font-medium text-zinc-100">
        {formatCurrency(item.amount)} <span className="text-muted">({item.percentage}%)</span>
      </p>
    </div>
  );
}

export function DonutChart({ data }: DonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted">
        No expenses recorded this month
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <ResponsiveContainer width="100%" height={240} className="sm:max-w-[240px]">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={2}
            cornerRadius={4}
            stroke="#0f0f0f"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
      <ul className="flex w-full flex-col gap-2.5">
        {data.map((entry) => (
          <li key={entry.categoryId} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span aria-hidden>{entry.icon}</span>
            <span className="text-zinc-300">{entry.name}</span>
            <span className="ml-auto font-medium text-zinc-100">{formatCurrency(entry.amount)}</span>
            <span className="w-12 text-right text-xs text-muted">{entry.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
