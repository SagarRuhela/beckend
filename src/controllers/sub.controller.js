import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import { apiResponse } from "../utils/apiResponse.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {subscriberId} = req.user._id;
    if(!isValidObjectId(channelId)){
        throw new apiError(400, "Invalid Channel Id")
    }
    if(!isValidObjectId(subscriberId)){
        throw new apiError(400, "Invalid Subscriber Id")
    }
    const isSubscribed=await Subscription.findOne({channel:channelId,subscriber:subscriberId});
    if(isSubscribed){
        await Subscription.findByIdAndDelete(isSubscribed._id); 
        return res.status(200).json(new apiResponse(200,{}, "Unsubscribed Successfully"))
    }
    else{
        const newSubscription= await Subscription.create({channel:channelId,subscriber:subscriberId});
        const newSub=await Subscription.findById(newSubscription._id);
        if(!newSub){
            throw new apiError(400,"Subscription Failed")
        }
        return res.status(200).json(new apiResponse(200,newSub, "Subscribed Successfully"))
    }
    // TODO: toggle subscription
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new apiError(400, "Invalid Channel Id")
    }
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                subscribers: {
                    $arrayElemAt: ["$subscribers", 0]
                }
            }
        }
        
        
    ])
    if(subscribers.length===0){
        throw new apiError(400, "No Subscribers Found")
    }
    return res.status(200).json(new apiResponse(200, subscribers, "Subscribers Found"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new apiError(400, "Invalid Subscriber Id")
    }
    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels"
            }
        },
        {
            $addFields: {
                channels: {
                    $arrayElemAt: ["$channels", 0]
                }
            }
        },
        {
            $project: {
                "channels.password": 0,
                "channels.refreshToken": 0,
                "channels.watchHistory": 0,
                "chanwls.email": 0,
            }
        }
    ])
    if(channels.length===0){
        throw new apiError(400, "No Channels Found")
    }
    return res.status(200).json(new apiResponse(200, channels, "Channels Found"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}