import { prisma } from "../config/db";

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

export async function getSummary(userId: string) {
  const now = new Date();
  const from = startOfMonth(now);
  const to = startOfNextMonth(now);

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: from, lt: to } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: from, lt: to } },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Number(incomeAgg._sum.amount ?? 0);
  const totalExpense = Number(expenseAgg._sum.amount ?? 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    month: now.toLocaleString("en-US", { month: "long" }),
    year: now.getFullYear(),
  };
}

export async function getByCategory(userId: string) {
  const now = new Date();
  const from = startOfMonth(now);
  const to = startOfNextMonth(now);

  const grouped = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "EXPENSE", date: { gte: from, lt: to } },
    _sum: { amount: true },
  });

  const total = grouped.reduce((sum, g) => sum + Number(g._sum.amount ?? 0), 0);

  if (grouped.length === 0) {
    return [];
  }

  const categories = await prisma.category.findMany({
    where: { id: { in: grouped.map((g) => g.categoryId) } },
  });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return grouped
    .map((g) => {
      const category = categoryMap.get(g.categoryId);
      const amount = Number(g._sum.amount ?? 0);
      return {
        categoryId: g.categoryId,
        name: category?.name ?? "Unknown",
        icon: category?.icon ?? "❓",
        color: category?.color ?? "#6366f1",
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export async function getMonthly(userId: string) {
  const now = new Date();
  const months: { label: string; from: Date; to: Date }[] = [];

  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const from = startOfMonth(monthDate);
    const to = startOfNextMonth(monthDate);
    months.push({
      label: monthDate.toLocaleString("en-US", { month: "short", year: "2-digit" }),
      from,
      to,
    });
  }

  const results = await Promise.all(
    months.map(async ({ label, from, to }) => {
      const [incomeAgg, expenseAgg] = await Promise.all([
        prisma.transaction.aggregate({
          where: { userId, type: "INCOME", date: { gte: from, lt: to } },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, type: "EXPENSE", date: { gte: from, lt: to } },
          _sum: { amount: true },
        }),
      ]);

      return {
        month: label,
        income: Number(incomeAgg._sum.amount ?? 0),
        expense: Number(expenseAgg._sum.amount ?? 0),
      };
    })
  );

  return results;
}

export async function getRecent(userId: string) {
  return prisma.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 5,
  });
}
