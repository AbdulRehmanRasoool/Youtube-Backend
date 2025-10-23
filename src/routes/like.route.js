import { Router } from "express";
import { getLikeVideos, toggleCommentLike, toggleVideoLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggleVideoLike/:videoId").put(verifyJWT, toggleVideoLike);
router.route("/toggleCommentLike/:videoId").put(verifyJWT, toggleCommentLike);
router.route("/getLikeVideos").get(verifyJWT, getLikeVideos);

export default router;