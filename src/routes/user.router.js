import { Router } from "express";
import {loggedOut, loginUser, registerUser} from "../controllers/user.js";
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

export default router;