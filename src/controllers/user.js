import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudnary.js"
import { apiResponse } from "../utils/apiResponse.js";
import * as bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken';
//import pkg from 'jsonwebtoken';
//const { jwt } = pkg;
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
        throw new apiError(400,"field canNot be empty"); 
      }     
       const existedUser= await User.findOne({
        $or:[{email},{userName}]
      });
      if(existedUser){
        throw new apiError(409,"User with either userName or email exit");
      }
      // checking for avatar and coverImage
          const avatarLocalPath=req.files?.avatar?.[0]?.path;
          if(!avatarLocalPath){
            throw new apiError(400,"Avatar file is required");
          }
          //const coverImageLocalPath=req.files?.coverImage[0]?.path;
          let coverImageLocalPath;
          if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
              coverImageLocalPath = req.files.coverImage[0].path
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
// here we are making a method or access Token and refresh Token
const generateAccessAndRefreshToken= async(userId)=>{
  try {
    const user= await User.findById(userId);
    const refreshToken= await user.generateRefreshToken();
    const accessToken = await user.generateAccessToken();
    user.refreshToken=refreshToken;
    await user.save({ValidateBeforeSave:false});
    return {accessToken,refreshToken};
    
  } catch (error) {
    throw new apiError(500,"Something went Wrong in Access or Refresh Token");
  }
}
const loginUser=asyncHandler(async(req,res)=>{
  // req-body se data le aao
  // userNmae or email
  // password
  // check user exist krta h ki nhi
  // if existed then check for password
  // give user a access token and a refresh token
  // send cookies for sending the access token and Refresh token
  const{userName,email,password}=req.body;
  //console.log(password);
       if(!(userName || email)){
        throw new apiError(400,"userName or email is required");
       }

       const user= await User.findOne({
        $or: [{userName},{email}]
       })
       console.log(user);
       if(!user){
        throw new apiError(400,"userName or email is not registered")
       }
       // check for password
       
       const isPasswordValid= await user.isPasswordCorrect(password);

       if(!isPasswordValid){
        throw new apiError(400,"Password is incorrect");
       }
       const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id);
       // upr jo user hai wha pr access token and refresh token ki filed khali hai toh hum ab ek gye user firse call krege so that we have 
       // a user jiske pass access token and refresh token ho mainly refresh token save ho database mai
       console.log(refreshToken);
       const loggedInUser=await User.findById(user._id).select(
        "-password -refreshToken");

        //now we are going to make options(method) used for cookies security
        const options={
          httpOnly:true,
          secure:true,
        }
        // here we are going to return the response along with cookies
        return res.status(200).cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new apiResponse(
          200,
          {
            user:loggedInUser,refreshToken,accessToken
            // refreshToken:refreshToken,
            // accessToken:accessToken,

          },
          "The user is loggedIn successfully"
        ))

})

// here we are going to logged out user
const loggedOut=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken:undefined,
        }

      },
      {
          new:true,// new means retured mai jo response milega vo new updated value milegi
      }
      )
      const options={
        httpOnly:true,
        secure:true,
      }
      return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(new apiResponse(200,{},"User logged Out"));

}
)

const refreshAccessToken=asyncHandler(async(req,res)=>{
 try {
   const incomingRefershToken=req.cookies?.refreshToken || req.body.refreshToken;
   //console.log(incomingRefershToken);
   if(!incomingRefershToken){
     throw new apiError(401,"Refersh token is not find")
   }
   //console.log("here");
   const decodedToken=Jwt.verify(incomingRefershToken, process.env.REFRESH_TOKEN_SECRET);
   if(!decodedToken){
     throw new apiError(401,"Token not verifird");
   }
    const user=await User.findById(decodedToken?._id);
    if(!user){
     throw new apiError(401,"User is invalid");
    }
    if(incomingRefershToken!=user?.refreshToken){
     throw new apiError(401,"refersh Token is inavild or expired")
    }
    const {refreshToken,accessToken}= await generateAccessAndRefreshToken(user?.id);
    const options={
     httpOnly:true,
     secure:true,
   }
   return res.status(200)
   .cookie("refereshToken",refreshToken,options)
   .cookie("accessToken",accessToken,options)
   .json(
     new apiResponse(
       200,
       {refreshToken,accessToken},
       "acceess token and refresh Token is refreshed"
     )
   )
 } catch (error) {
  throw new apiError(401, error?.message || "invalid Refersh Token")
  
 }
   

})

export { registerUser,
          loginUser,
          loggedOut,
          refreshAccessToken
        };