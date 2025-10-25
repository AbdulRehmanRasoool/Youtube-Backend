import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlayist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router = Router();

router.route("/createPlaylist").post(verifyJWT, createPlaylist);
router.route("/getUserPlaylist/:userId").get(getUserPlayist);
router.route("/getPlaylistById/:playlistId").get(getPlaylistById);
router.route("/addVideoToPlaylist/:playlistId/:videoId").post(verifyJWT, addVideoToPlaylist);
router.route("/removeVideoFromPlaylist/:playlistId/:videoId").delete(verifyJWT, removeVideoFromPlaylist);
router.route("/deletePlaylist/:playlistId").delete(verifyJWT, deletePlaylist)
router.route("/updatePlaylist/:plyalistId").put(verifyJWT, updatePlaylist);

export default router;