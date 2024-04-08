import { Router } from "express";
import {loggedOut, loginUser, registerUser,refreshAccessToken} from "../controllers/user.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";
const router=Router();

router.route("/register").post(
    upload.fields([
        {   name:"avatar",
            maxCount:1   
         },
        { name:"coverImage",
         maxCount:1,
        }
    ]),
    registerUser);

router.route("/login").post( loginUser);
// secure Routes
router.route("/loggedOutUser").post(verifyJWT,loggedOut);
// route for refresh the refresh Access Toeken
router.route("/refreshToken").post(refreshAccessToken);

export default router;