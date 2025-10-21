import { Router } from "express";
import { createComment, deleteComment, getComments, updateComment } from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getComments").get(getComments);
router.route("/createComment").post(verifyJWT, createComment);
router.route("/updateComment").post(verifyJWT, updateComment);
router.route("/deleteComment").post(verifyJWT, deleteComment);