import mongoose,{Schema} from "mongoose";
import Jwt from 'jsonwebtoken';
//const {Jwt} = pkg;
import * as bcrypt from 'bcrypt'
//const {bcrypt} = pkg1;

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
     const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        user.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});
// checking if password is correct or not
userSchema.methods.isPasswordCorrect=async function(Enterpassword){
    //console.log(Enterpassword);
     //console.log(this.password);
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(Enterpassword, salt);
    //console.log(hashedPassword)
    return await bcrypt.compare(Enterpassword,this.password);
};
userSchema.methods.generateAccessToken=function(){
    return  Jwt.sign({
        _id: this._id,
        email: this.email,
        fullName: this.fullName,
        userName: this.userName,
    },process.env.ACCESS_TOKEN_SECRET,{
         expiresIn:process.env.ACCESS_TOKEN_EXPIERY,
    }
    ) 
}
userSchema.methods.generateRefreshToken=function(){
    return Jwt.sign({
        _id: this._id,
    },process.env.REFRESH_TOKEN_SECRET,{
         expiresIn:process.env.REFRESH_TOKEN_EXPIERY,
    }
    )
    //return token;
}
export const User=mongoose.model("User",userSchema);