import { Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AuthenticatedRequest } from "../middleware/auth";
import * as analyticsService from "../services/analytics.service";
import { UnauthorizedError } from "../utils/AppError";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) throw new UnauthorizedError();
  return req.user.id;
}

export const summary = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const data = await analyticsService.getSummary(userId);
  res.status(200).json({ success: true, data });
});

export const byCategory = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const data = await analyticsService.getByCategory(userId);
  res.status(200).json({ success: true, data });
});

export const monthly = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const data = await analyticsService.getMonthly(userId);
  res.status(200).json({ success: true, data });
});

export const recent = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = requireUserId(req);
  const data = await analyticsService.getRecent(userId);
  res.status(200).json({ success: true, data });
});
