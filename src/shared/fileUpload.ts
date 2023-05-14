import { Request, Response } from "express";
import { appendFileSync } from "fs";
import path from "path";
import imageUploader from "./imageUploader";

export default function fileUpload(req:Request,res:Response,type:"artwork"|"profilepic"|"audio"){
  const fileName = req.params.filename;
  if(type === "audio"){
    const filePath = path.join(__dirname,"../../public",fileName);
    res.status(206);
    req.on("data", (chunk)=>{
      appendFileSync(filePath,chunk);
    })
    req.on("error",(err)=>{
      res.status(400).json({error:err});
    })
  
    res.json({message:"file uploaded"});
  }else{
    imageUploader(req,res,type,fileName);
  }
  
}