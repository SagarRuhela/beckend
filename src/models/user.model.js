import mongoose,{Schema} from "mongoose";
import {Jwt} from "jsonwebtoken";
import {bcrypt } from "bcrypt";

const userSchema=new Schema({
    userName:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true,// uesd for searching
    },
    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true,
      
    },
    fullName:{
        type:String,
        require:true,
        trim:true,
        index:true,
    },
    avatar:{
        type:String, // cloudnary url
        require:true,
    },
    coverImage:{
        type:String,// cloudnary url
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:String,
        required:[true,"Passward is required"],
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true});
userSchema.pre("save",async function(next){
     // here we want to encrypt our password
     if(this.isModified("password")){// this is how we check if some thing is modified or not
        this.password=bcrypt.hash(this.password,10);
        next();
     }
     next();
})
// checking if password is correct or not
userSchema.methods.isPasswordCorrect=async function(){
    return await bcrypt.compare(password,this.password);
};
userSchema.methods.generateAccessToken=function(){
    var token=Jwt.sign({
        _id: this._id,
        email: this.email,
        fullName: this.fullName,
        userName: this.userName,
    },process.env.ACCESS_TOKEN_SECRET,{
         expiresIn:process.env.ACCESS_TOKEN_EXPIERY,
    }
    )
    return token;
}
userSchema.methods.generateRefreshToken=function(){
    var token=Jwt.sign({
        _id: this._id,
    },process.env.REFRESH_TOKEN_SECRET,{
         expiresIn:process.env.REFRESH_TOKEN_EXPIERY,
    }
    )
    return token;
}




export const User=mongoose.model("User",userSchems);