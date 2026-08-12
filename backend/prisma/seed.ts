import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@finance.com";
const DEMO_PASSWORD = "demo123456";

const DEFAULT_CATEGORIES: Array<{
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}> = [
  { name: "Food", icon: "🍕", color: "#f97316", type: "EXPENSE" },
  { name: "Transport", icon: "🚗", color: "#3b82f6", type: "EXPENSE" },
  { name: "Entertainment", icon: "🎬", color: "#a855f7", type: "EXPENSE" },
  { name: "Shopping", icon: "🛍️", color: "#ec4899", type: "EXPENSE" },
  { name: "Health", icon: "💊", color: "#14b8a6", type: "EXPENSE" },
  { name: "Housing", icon: "🏠", color: "#eab308", type: "EXPENSE" },
  { name: "Salary", icon: "💰", color: "#22c55e", type: "INCOME" },
  { name: "Freelance", icon: "💻", color: "#6366f1", type: "INCOME" },
  { name: "Other Income", icon: "📈", color: "#10b981", type: "INCOME" },
  { name: "Other Expense", icon: "📉", color: "#ef4444", type: "EXPENSE" },
];

const EXPENSE_DESCRIPTIONS: Record<string, string[]> = {
  Food: ["Grocery run", "Dinner out", "Coffee shop", "Lunch with friends", "Weekly groceries"],
  Transport: ["Gas fill-up", "Uber ride", "Monthly transit pass", "Parking fee", "Car maintenance"],
  Entertainment: ["Movie tickets", "Streaming subscription", "Concert tickets", "Video game", "Book purchase"],
  Shopping: ["New clothes", "Electronics", "Home decor", "Online order", "Gift for a friend"],
  Health: ["Pharmacy", "Gym membership", "Doctor visit", "Vitamins", "Dental checkup"],
  Housing: ["Rent payment", "Electricity bill", "Internet bill", "Water bill", "Furniture"],
  "Other Expense": ["Bank fee", "Subscription renewal", "Miscellaneous", "Donation", "Pet supplies"],
};

const INCOME_DESCRIPTIONS: Record<string, string[]> = {
  Salary: ["Monthly salary", "Salary payment"],
  Freelance: ["Freelance project", "Client invoice payment", "Consulting work"],
  "Other Income": ["Cashback reward", "Interest earned", "Gift received"],
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomDateWithinLastMonths(months: number): Date {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - months, 1);
  const end = now;
  const timestamp = randomInt(start.getTime(), end.getTime());
  return new Date(timestamp);
}

async function main() {
  console.log("Seeding database...");

  await prisma.refreshToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Demo User",
      passwordHash,
    },
  });

  const categories = await Promise.all(
    DEFAULT_CATEGORIES.map((category) =>
      prisma.category.create({
        data: { ...category, userId: user.id },
      })
    )
  );

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  const transactionsData: Array<{
    amount: number;
    description: string;
    date: Date;
    type: TransactionType;
    categoryId: string;
    userId: string;
  }> = [];

  // 12 income transactions (roughly 2/month over 6 months)
  for (let i = 0; i < 12; i += 1) {
    const category = randomChoice(incomeCategories);
    const descriptions = INCOME_DESCRIPTIONS[category.name] ?? ["Income"];
    const amount = category.name === "Salary" ? randomInt(3000, 4500) : randomInt(200, 1500);
    transactionsData.push({
      amount,
      description: randomChoice(descriptions),
      date: randomDateWithinLastMonths(6),
      type: "INCOME",
      categoryId: category.id,
      userId: user.id,
    });
  }

  // 38 expense transactions spread across last 6 months
  for (let i = 0; i < 38; i += 1) {
    const category = randomChoice(expenseCategories);
    const descriptions = EXPENSE_DESCRIPTIONS[category.name] ?? ["Expense"];
    const amount = category.name === "Housing" ? randomInt(500, 1500) : randomInt(10, 300);
    transactionsData.push({
      amount,
      description: randomChoice(descriptions),
      date: randomDateWithinLastMonths(6),
      type: "EXPENSE",
      categoryId: category.id,
      userId: user.id,
    });
  }

  await prisma.transaction.createMany({ data: transactionsData });

  console.log(`Seeded 1 user, ${categories.length} categories, ${transactionsData.length} transactions.`);
  console.log(`Demo login -> email: ${DEMO_EMAIL} | password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
