import mongoose,{Schema} from "mongoose";
const subscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,// the person who is subscribing 
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,// the person whos channel is subscribing by the subscriber
        ref:"User"
    }

},{timestamps:true})

export const subscription=mongoose.model("subscription",subscriptionSchema);