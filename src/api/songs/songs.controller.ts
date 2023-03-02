import { Request, Response } from "express";
import * as service from "./songs.service";
import { sendResponse } from "../../shared/Response";

export async function storeAudioFile(req:Request, res:Response){
  const responseData = await service.storeAudioFile(req,res);
}
export async function storeArtworkFile(req:Request, res:Response){
  const responseData = await service.storeArtworkFile(req,res);
}

export async function store(req:Request, res:Response){
  const responseData = await service.store(req.body);
  sendResponse(res,responseData);
}

export async function getAudioFile(req:Request, res:Response){
  service.streamAudio(req,res);
}

export async function get(req:Request, res:Response){
  const responseData = await service.get();
  sendResponse(res,responseData);
}