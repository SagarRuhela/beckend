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
//import { Video } from "C:/Users/acer/Desktop/beckend/src/models/vedio.model.js"

const addVideo = asyncHandler(async (req, res, next) => {
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

export { addVideo };
