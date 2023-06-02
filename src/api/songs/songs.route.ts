import { Router } from "express";
import * as controller from "./songs.controller"
export const router = Router();

// store audio file and artwork file
router.post("/audio/:filename",controller.storeAudioFile);
router.post("/artwork/:filename",controller.storeArtworkFile);

// stream audio
router.get("/audio/:filename",controller.getAudioFile)

// save song's info
router.post("/",controller.store);

// get songs
router.get("/",controller.get);