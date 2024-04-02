import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import Jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT=asyncHandler(async(req,res,next)=>{
// we need token mainly access token 
try {
    const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","");
       if(!token){
        throw new apiError(401,"Unauthorized Request");
       }
      const decodedToken=await Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new apiError(401,"Invalid Acess Token")
        }
        // now add new object to req so that we can use it where we call this middle where
        req.user=user;//here user is object which carry the user of the model where this middle where called
        next();
} catch (error) {
    throw new apiError(401,error?.message || "Invalid Access Token ")
}
})