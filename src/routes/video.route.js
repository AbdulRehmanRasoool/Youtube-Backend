import { Router } from "express";
import { deleteVideo, getVideo, getVideos, publishVideo, updateVideo, updateVideoStatus } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/getVideos").get(getVideos);
router.route("/publishVideo").post(verifyJWT, upload.fields([
    {
        name: "content",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), publishVideo);
router.route("/getVideo/:videoId").get(getVideo);
router.route("/updateVideo/:videoId").put(verifyJWT, updateVideo);
router.route("/deleteVideo/:videoId").delete(verifyJWT, deleteVideo);
router.route("/updateVideoStatus/:videoId").put(verifyJWT, updateVideoStatus);

export default router;