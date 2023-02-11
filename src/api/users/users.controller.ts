import { Request, Response } from "express";
import * as service from "./users.service";
import { sendResponse } from "../../shared/Response";

export async function signup(req:Request, res:Response){
  const responseData = await service.signup(req.body);
  sendResponse(res,responseData);
}

export async function getOne(req:Request, res:Response){
  const responseData = await service.getOne(req.params);
  sendResponse(res,responseData);
}
