import { Request, Response, Router } from "express";
import * as controller from "./users.controller"
import { uploadFile } from "../../shared/uploadFile";
import { randomUUID } from "crypto";

export const router = Router();

router.post("", controller.signup);

router.get("/:uid", controller.getOne)

router.post("/songs/:name", (req:Request,res:Response)=>{
  const name = req.params.name;
  res.status(206);
  uploadFile(req,"audio",name)
  .then(path=>{
    res.send({status:"success", path})
  })
  .catch(err=>{
    res.send({status:"error", err})
  })
})