import { Router } from "express";
import { login, logout, refreshAccessToken, register } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();


router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    }, 
    {
        name: "coverImage",
        maxCount: 1
    }
]), register);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, logout);
router.route("/refreshAccessToken").post(refreshAccessToken);

export default router;