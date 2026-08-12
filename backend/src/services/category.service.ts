import { prisma } from "../config/db";
import { NotFoundError } from "../utils/AppError";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validators";

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(userId: string, input: CreateCategoryInput) {
  return prisma.category.create({
    data: { ...input, userId },
  });
}

async function assertOwnership(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) {
    throw new NotFoundError("Category not found");
  }
  return category;
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  input: UpdateCategoryInput
) {
  await assertOwnership(userId, categoryId);
  return prisma.category.update({
    where: { id: categoryId },
    data: input,
  });
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  await assertOwnership(userId, categoryId);
  await prisma.category.delete({ where: { id: categoryId } });
}
