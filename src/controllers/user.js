import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudnary.js"
import { apiResponse } from "../utils/apiResponse.js";
const registerUser=asyncHandler( async (req,res)=>{
    // get user deails form user 
    // check all the validaton like non empty 
    // check if user is already exist or not
    // check for images or check for avatar
    // upload them to cloudnary
    // create the object or crate the entry in dp
    // remove password and refresh token 
    // check for user creation
    // return response


   const{ userName,email,fullName,password,}=req.body;// this is how we get all the values from form and json data and for URL we hve differnt method
                  console.log("Email is",email);
      // here checking for emptyField
      if([fullName,email,userName,password].some((field)=>{
        if(field.trim()===""){
            return true;
        }
        else{
            return false;
        }
      })){
        throw new apiError(400,"filed canNot be empty"); 
      }     
       const existedUser= await User.findOne({
        $or:[{email},{userName}]
      });
      if(existedUser){
        throw new apiError(409,"User with either userName or email exit");
      }
      // checking for avatar and coverImage
          const avatarLocalPath=req.files?.avatar[0]?.path;
          //const coverImageLocalPath=req.files?.coverImage[0]?.path;
          let coverImageLocalPath;
          if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
              coverImageLocalPath = req.files.coverImage[0].path
          }

          if(!avatarLocalPath){
            throw new apiError(400,"Avatar file is required");
          }
      
       const avatar=await uploadOnCloudnary(avatarLocalPath);
       const coverImage=await uploadOnCloudnary(coverImageLocalPath);
       if(!avatar){
        throw new apiError(400,"Avatar file is required");
       }
       const user=await User.create({
        fullName,
        userName:userName.toLowerCase(),
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
       });

       const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
       );
       
       if(!createdUser){
        throw new apiError(500,"something went wrong while registering the User");
       }
       
       return res.status(201).json(
        new apiResponse(200, createdUser,"User registerd successfully")
       );


})

export { registerUser};