import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannel, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router();

router.route("/toggleSubscription").put(verifyJWT, toggleSubscription);
router.route("/getUserChannelSubscribers").get(verifyJWT, getUserChannelSubscribers);
router.route("/getSubscribedChannels").get(verifyJWT, getSubscribedChannel);

export default router;