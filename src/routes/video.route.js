import { Router } from "express";
import { getVideos, publishVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/getVideos").get(getVideos);
router.route("/publishVideo").post(publishVideo);

export default router;