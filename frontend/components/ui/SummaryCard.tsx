import { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { formatCurrency } from "@/lib/format";

type Variant = "income" | "expense" | "balance";

interface SummaryCardProps {
  icon: LucideIcon;
  label: string;
  amount: number;
  variant: Variant;
}

const variantStyles: Record<Variant, { text: string; bg: string; ring: string }> = {
  income: { text: "text-income", bg: "bg-income/10", ring: "ring-income/20" },
  expense: { text: "text-expense", bg: "bg-expense/10", ring: "ring-expense/20" },
  balance: { text: "text-accent", bg: "bg-accent/10", ring: "ring-accent/20" },
};

export function SummaryCard({ icon: Icon, label, amount, variant }: SummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div className={clsx("flex h-9 w-9 items-center justify-center rounded-lg ring-1", styles.bg, styles.ring)}>
          <Icon size={18} className={styles.text} />
        </div>
      </div>
      <p className={clsx("mt-3 text-2xl font-semibold", styles.text)}>{formatCurrency(amount)}</p>
    </div>
  );
}
