import { Router } from "express";
import * as controller from "./users.controller"

export const router = Router();

router.post("", controller.signup);

router.get("/:uid", controller.getOne)