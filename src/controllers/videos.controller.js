//import Video from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudnary } from "../utils/cloudnary.js";
import { deleteImage } from "../utils/CloudnaryDelete.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/vedio.model.js";
import { subscription } from "../models/subscriptions.model.js";
import { pipeline } from "stream";
import mongoose from "mongoose";
import { create } from "domain";
//import { Video } from "C:/Users/acer/Desktop/beckend/src/models/vedio.model.js"

const addVideo = asyncHandler(async (req, res) => {
    try {
        const { title, description } = req.body;

        const videoFile = req.files?.videoFile?.[0]?.path;
        
        const thumnail = req.files?.thumnail?.[0]?.path;
        console.log("Video File", videoFile);
        console.log("Thumnail", thumnail);
        console.log("Title", title);
        console.log("Description", description);
        if (!(title || description || videoFile || thumnail)) {
            throw new apiError(400, "Please Provide all the required fields");
        }
        // now going to upload in cloudnary
        const videoFileUrl = await uploadOnCloudnary(videoFile);
        if (!videoFileUrl.url) {
            throw new apiError(400, "Error while uploading video file");
        }
        console.log("Video File URL", videoFileUrl.url);
        const thumnailUrl = await uploadOnCloudnary(thumnail);
        if (!thumnailUrl.url) {
            throw new apiError(400, "Error while uploading thumnail file");
        }

        const video = await Video.create({
            title,
            description,
            videoFile: videoFileUrl?.url,
            thumnail: thumnailUrl?.url,
            ispublished: true,
            views:1,
            owner: req?.user?._id,
        });
        if (!video) {
            throw new apiError(400, "Error while creating schema for video");
        }

        return res.status(200).json(new apiResponse(200, video, "Video Uploaded Successfully"));
    } catch (error) {
        throw new apiError(400, error.message);
    }
})
// Rest of the code...

const getAllVideos = asyncHandler(async (req, res) => {
    try {
        var { page = 1, limit = 10, query, sortBy, sortType,userId} = req.query;
        const skip = (page - 1) * limit;
       
       
        console.log("here");
          const video= await Video.aggregate([
            {
                $match: {
                    owner:new mongoose.Types.ObjectId(req?.user?._id),
                    isPublished:true

                }
                
            },
            {$skip: skip},
            {
            $limit: limit,
            },
            
            {
            $sort: {
                createdAt: -1,
            },
                
            }

          ]);
          //console.log("video",video);
       if(video.length===0){
           throw new apiError(400,"No Video Found");
       }
         return res.status(200).json(new apiResponse(200,video,"All Videos"));


        
    } catch (error) {
        throw new apiError(400, error.message);
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findById(id);
        if (!video) {
            throw new apiError(400, "No Video Found");
        }
        return res.status(200).json(new apiResponse(200, video, "Video Found"));
    } catch (error) {
        throw new apiError(400, error.message);
    }
});
 const updateVideo=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    if(!id){
        throw new apiError(400,"Please Provide Video Id")
    }
    const {title,description}=req.body;
    if(!(title || description)){
        throw new apiError(400,"Please Provide all the required fields")
    }
    const video=await Video.findById(id);
    if(!video){
        throw new apiError(400,"No Video Found");    
    }
    video.title=title;
    video.description;
    await video.save();
    return res.status(200).json({message:"Video Updated Successfully"});
 });
 const deleteVideo=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    if(!id){
        throw new apiError(400,"Please Provide Video Id")
    }
    const video=await Video.findByIdAndDelete(id);
    if(!video){
        throw new apiError(400,"No Video Found");    
    }
    const isdelete=await deleteImage(video.videoFile);
    if(!isdelete){
        throw new apiError(400,"Error while deleting video file");
    }
    res.status(200).json({message:"Video Deleted Successfully"});

 });
 const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = await Video.findById(videoId);
    video.isPublished = !video.isPublished;
    await video.save();
    res.status(200).json({ message: "Video Published Status Toggled Successfully" });
})

export { addVideo, getAllVideos,getVideoById,updateVideo,deleteVideo,togglePublishStatus};
