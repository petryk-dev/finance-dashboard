import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { ConflictError, UnauthorizedError } from "../utils/AppError";
import {
  refreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import type { LoginInput, RegisterInput } from "../validators/auth.validators";

const SALT_ROUNDS = 12;

const DEFAULT_CATEGORIES: Array<{
  name: string;
  icon: string;
  color: string;
  type: "INCOME" | "EXPENSE";
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

function sanitizeUser(user: { id: string; email: string; name: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

async function issueTokens(userId: string, email: string) {
  const accessToken = signAccessToken({ sub: userId, email });
  const refreshToken = signRefreshToken({ sub: userId });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: refreshTokenExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    await tx.category.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({
        ...category,
        userId: created.id,
      })),
    });

    return created;
  });

  const tokens = await issueTokens(user.id, user.email);

  return { user: sanitizeUser(user), ...tokens };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const isValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const tokens = await issueTokens(user.id, user.email);

  return { user: sanitizeUser(user), ...tokens };
}

export async function refresh(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token is no longer valid");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new UnauthorizedError("User no longer exists");
  }

  const accessToken = signAccessToken({ sub: user.id, email: user.email });

  return { accessToken };
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}
