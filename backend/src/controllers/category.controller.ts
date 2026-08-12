import { Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middleware/auth";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validators";
import * as categoryService from "../services/category.service";
import { UnauthorizedError } from "../utils/AppError";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.id;
}

export const list = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const categories = await categoryService.listCategories(userId);
  res.status(200).json({ success: true, data: categories });
});

export const create = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const input = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(userId, input);
  res.status(201).json({ success: true, data: category });
});

export const update = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const input = updateCategorySchema.parse(req.body);
  const category = await categoryService.updateCategory(userId, req.params.id, input);
  res.status(200).json({ success: true, data: category });
});

export const remove = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  await categoryService.deleteCategory(userId, req.params.id);
  res.status(200).json({ success: true, message: "Category deleted" });
});
