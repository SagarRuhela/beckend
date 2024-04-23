import { Router } from "express";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { toggleSubscription, getSubscribedChannels,getUserChannelSubscribers } from "../controllers/sub.controller.js";
const router=Router();
router.use(verifyJWT);
router.route("/toggleSubscription").post(toggleSubscription);
router.route("/getSubscribedChannels/:subscriberId").get(getSubscribedChannels);
router.route("/getUserChannelSubscribers/:channelId").get(getUserChannelSubscribers);