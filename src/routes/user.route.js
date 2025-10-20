import { Router } from "express";
import { getUserProfile, updateUserAvatar, updateUserCover, updateUserDetails, updateUserPassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/getUserProfile").get(verifyJWT, getUserProfile);
router.route("/updateUserPassword").put(verifyJWT, updateUserPassword);
router.route("/updateUserDetails").put(verifyJWT, updateUserDetails);
router.route("/updateUserAvatar").put(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/updateUserCover").put(verifyJWT, upload.single("coverImage"), updateUserCover);

export default router;