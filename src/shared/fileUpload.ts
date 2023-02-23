import { Request, Response } from "express";
import { appendFileSync } from "fs";
import path from "path";

export default function fileUpload(req:Request,res:Response,type:"artwork"|"profilepic"|"audio",fileName:string){
  const filePath = path.join(__dirname,"../../public",type,fileName);

  res.status(206);
  req.on("data", (chunk)=>{
    appendFileSync(filePath,chunk);
  })
  req.on("error",(err)=>{
    res.status(400).json({error:err});
  })
  res.json({message:"file uploaded"});
}