import express from "express";
import * as controller from "./auth.controller"

export const router = express.Router();

router.post("", controller.refreshToken)

router.post("/signin", controller.login)

router.post("/signout", controller.logout)