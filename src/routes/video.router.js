import { Router } from "express";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import { addVideo } from "../controllers/videos.controller.js";
const router=Router();
router.use(verifyJWT);
router.route("/addVideo").post(upload.fields([{
    name:"videoFile",
    maxCount:1
},
{
    name:"thumnail",
    maxCount:1
}]),addVideo);
export default router;
