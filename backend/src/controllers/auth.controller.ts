import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { loginSchema, refreshSchema, registerSchema } from "../validators/auth.validators";
import * as authService from "../services/auth.service";

export const register = catchAsync(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  res.status(201).json({ success: true, data: result });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  res.status(200).json({ success: true, data: result });
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const input = refreshSchema.parse(req.body);
  const result = await authService.refresh(input.refreshToken);
  res.status(200).json({ success: true, data: result });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const input = refreshSchema.parse(req.body);
  await authService.logout(input.refreshToken);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
