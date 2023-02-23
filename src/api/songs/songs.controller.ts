import { Request, Response } from "express";
import { sendResponse } from "../../shared/Response";
import * as service from "./songs.service";
async function storeAudio(req:Request, res:Response){
  const responseData = await service.storeAudio();
}