import mongoose,{Schema} from "mongoose";

const likeSchema=new Schema({
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }

},{timestamps:true});

export const Like=mongoose.model("Like",likeSchema);