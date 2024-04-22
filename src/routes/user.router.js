import { Router } from "express";
import {loggedOut, loginUser, registerUser,refreshAccessToken, changeCurrentPassward, getcurrentUser, updateAccountDetails, 
    updateUserAvatar, updateUserCoverImage, getUserChannelProfile,getWatchedHistory} from "../controllers/user.js";
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

router.route("/changePassword").patch(verifyJWT,changeCurrentPassward);

router.route("/currentUser").get(verifyJWT,getcurrentUser);

router.route("/updateAccountDetails").patch(verifyJWT,updateAccountDetails);

router.route("/updateAvatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar);

router.route("/updateCoverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage);

router.route("/c/:userName").get(verifyJWT,getUserChannelProfile);

router.route("/getWatchHistory").get(verifyJWT,getWatchedHistory);


export default router;