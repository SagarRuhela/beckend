import 'dotenv/config'
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = (req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")).trim();
console.log("Token:", token);

try {
    if (!token) {
        throw new apiError(401, "Unauthorized Request");
    }
    const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded Token:", decodedToken);
    // Proceed with user retrieval and authentication
} catch (error) {
    console.error("JWT verification failed:", error);
    // Handle verification failure
}

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