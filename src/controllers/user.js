import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudnary} from "../utils/cloudnary.js"
import { deleteImage } from "../utils/CloudnaryDelete.js";
import { apiResponse } from "../utils/apiResponse.js";
import * as bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken';
import fs from 'fs';
import { subscription } from "../models/subscriptions.model.js";
import { Mongoose } from "mongoose";
import { pipeline } from "stream";
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

          throw new apiError(400,"Avatar file is required ,Error on finding local path of avatar");
        }
        //const coverImageLocalPath=req.files?.coverImage[0]?.path;
        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        
    
     const avatar=await uploadOnCloudnary(avatarLocalPath);
     const coverImage=await uploadOnCloudnary(coverImageLocalPath);
     if(!avatar){
        //fs.unlink(avatar);
        if(coverImage){
        fs.unlink(coverImage);
      }
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

//  change the password
const changeCurrentPassward=asyncHandler(async(req,res)=>{
const {currentPassword,newPassword}=req.body;

// now we are going to get the user form the auth middleware
 const user=await User.findById(req?.user?._id);
 // chaking for old paasword Correction
 const isPasswordCorrect=await user.isPasswordCorrect(currentPassword);
 if(!isPasswordCorrect){
  throw new apiError(401,"Old / current Password is not matched");
 }
 user.password=newPassword;
 await user.save({ValidateBeforeSave:false});
 return res.status(200)
 .json(new apiResponse(200,{},"the password is Updated Correctly"));
});

// for geeting the current user
const getcurrentUser =asyncHandler(async(req,res)=>{
  return res.status(200).json(
    200,
    req.user,
    "The current user is fetched succesfully"
  )
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
 const {fullName,email,} =req.body;
 if(!fullName || !email){
  throw new apiError(400,"All field is needed")
 }
 const user=User.findByIdAndUpdate(req?.user?._id,
{
  $set:{
    fullName:fullName,
    email:email,

  }
},
{
new:true,
}).select("-password");

return res.status(200).json(
new apiResponse(200,"The account Deatils is updated")
);
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
// first we are going to get the files by the user
const avatarLocalPath= req.file?.path;
if(!avatarLocalPath){
throw new apiError(400,"Avatar file is required for updataion");
}
const avatar= await uploadOnCloudnary(avatarLocalPath);
if(!avatar.url){
throw new apiError(400,"avator is not uploaded on cloudnary")
}
// here takin the url of the old avatar image so that we can delete it after saving new image in databse
 const user1=await User.findById(req?.user?.id);
 const oldAvatar= await user1.avatar;
  //const isImageDelted=deleteImage(oldAvatar);
  
  const user= await User.findByIdAndUpdate(req?.user?._id,
  {
    $set:{
      avatar:avatar.url,
    }
  },{
    new:true,
  }).select("-passward");
  const isImageDelted=deleteImage(oldAvatar);
  if(isImageDelted){
    throw new apiError(501,"Old Image is not deleted");
  }

  

  return res.status(200).json(new apiResponse(200,user,"Avatar is updatd successfully and Old Image is deleted successfuly"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
// first we are going to get the files by the user
const coverLocalPath= req.file?.path;
if(!coverLocalPath){
throw new apiError(400,"Cover Image  file is required for updataion");
}
const cover= await uploadOnCloudnary(coverLocalPath);
if(!avatar.url){
throw new apiError(400,"Cover image  is not uploaded on cloudnary")
}
  const user= await User.findByIdAndUpdate(req?.user?._id,
  {
    $set:{
      coverImage:cover.url,
    }
  },{
    new:true,
  }).select("-passward");
  return res.status(200).json(new apiResponse(200,user,"Cover is updatd successfully"))
})

// for getting the user channel profiles such there subscriber and other details which are going to be shown in the user profile
const getUserChannelProfile=asyncHandler(async(req,res)=>{
const {userName}=req.params;
if(!userName?.trim()){
  throw new apiError(400,"UserName not found");
}

const channel=await User.aggregate([
  {
   $match:{userName:userName.toLowerCase()}
},
{
  // here we are finding the subscriber of the profile we are visiting or getting by thier username
  $lookup:{
    from: "subscriptions",
    localField:"_id",
    foreignField:"channel",
    as:"subscribers"
  }
},
{
  // here we are finding the users channels in which he subscribed
  $lookup:{
    from: "subscriptions",
    localField:"_id",
    foreignField:"subscriber",
    as:"subscribedTo"
  }
},
// her i am going to make new fields so that i can acess then in our databse with user id and we don't have to merge again and again
 {
  $addFields:{
    sunscriberCount:{
      $size:"$subscribers"
    },
    sunscribedTo:{
      $size:"$subscribedTo"
    },
    isSubscribed:{
      $cond:{
        if:{$in:[req?.user?._id, "$subscribers.subscriber"]},
        then: true,
        else:false

      }
    }
  }
 },
 {
  // it is used to give only seleted thing so that only useful thing will be given to the fronted for use
  $project:{
        // give 1 to give the filed otherwise don;t mention that field
        userName:1,
        fullName:1,
        avatar:1,
        coverImage:1,
        sunscriberCount:1,
        subscribedTo:1,
        isSubscribed:1,
        email:1

  }
 }



])

if(!channel?.length){
throw new apiError(400," channel doesn't exist");
}
return res.status(200).
json(new apiResponse(200, channel[0],"User channel fetechd successfully"))
})

const getWatchedHistory=asyncHandler( async(req,res)=>{
   const user=await User.aggregate(
    {
      $match:{
        _id:new Mongoose.Types.ObjectId(req?.user?._id)
      }
   },
   {
    $lookup:{
      form:"videos",
      localField:"watchHistory",
      foreignField:"_id",
      as:"watchHistory",
      pipeline:[
        {
          $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
              {
                $project:{
                  userName:1,
                  fullName:1,
                  avatar:1
                }
              }
            ]
          }
        }
        ,{
          $addFields:{
            owner:{
              $first:"$owner"// this is how we get the first field of the owner array which we get we we lookup or merge
            }
          }
        }
      ]
    }
   }
  )

  return res.status(200).json(new apiResponse(200,user[0].watchHistory),"watch history fetched successfully")
})

 



export { registerUser,
          loginUser,
          loggedOut,
          refreshAccessToken,
          changeCurrentPassward,
          getcurrentUser,
          updateAccountDetails,
          updateUserAvatar,
          updateUserCoverImage,
          getUserChannelProfile,
          getWatchedHistory
        };