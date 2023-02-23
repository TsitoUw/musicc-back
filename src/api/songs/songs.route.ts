import { Router } from "express";
import * as controller from "./songs.controller"
export const router = Router();

router.post("/audio/:filename",controller.storeAudioFile);
router.post("/artwork/:filename",controller.storeArtworkFile);

router.post("/",controller.store);

router.get("/audio/:filename",controller.getAudioFile)

router.get("/",controller.get);