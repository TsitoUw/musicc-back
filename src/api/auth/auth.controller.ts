import { Request, Response } from "express";
import * as service from "./auth.service"
import { sendResponse } from "../../shared/Response";

export const refreshToken = async (req: Request, res: Response) => {
  const responseData = await service.refreshToken(req.body);
  sendResponse(res, responseData);
}

export const login = async (req: Request, res: Response) => {
  const responseData = await service.login(req.body);
  sendResponse(res, responseData)
}

export const logout = async (req: Request, res: Response) => {
  const responseData = await service.logout(req.body);
  sendResponse(res, responseData)
}