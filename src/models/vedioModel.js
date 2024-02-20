import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema=new Schema({ 
    videoFile:{
        type:String,
        required:true, 
    },
    thumnail:{
        type:String,
        required:true, 
    },
    title:{
        type:String,
        required:true, 
    },
    description:{
        type:Number,
        required:true, 
    },
    views:{
      type:Number,
      default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",

    },
},{timestamps:true});
videoSchema.plugin(mongooseAggregatePaginate);


export const video=mongoose.model("video",videoSchema);