import 'dotenv/config'
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = (req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")).trim();
        //console.log("cookies",req.cookies);
        //console.log("header", req.header("Authorization"));
        //console.log("Token:", token);

    if (!token) {
        throw new apiError(401, "Unauthorized Request");
    }
// const decodedAccessToken = decodeURIComponent(token);
    //console.log(decodedAccessToken);
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    //console.log("Decoded Token:", decodedToken);
    // Proceed with user retrieval and authentication

   // console.error("JWT verification failed:", error);
    // Handle verification failure

//console.log("reched here");
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {        
            throw new apiError(401, "Invalid Access Token")
        }    
        //if all good , pass in user object to the request body so that next methods can access the data of body
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token")
    }
    
})