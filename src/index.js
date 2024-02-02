import 'dotenv/config'
import mongoose from "mongoose";
import connectDB from "./dp/index.js";
import app from './app.js';
connectDB().then(()=>{
       app.on("error", (error)=>{
        console.log("The error is ", error);
        throw error;
       });
      app.listen(process.env.PORT || 8000);
      console.log("Server is running at: ",process.env.PORT);
}).catch((error)=>{
    console.log("Mongo Db Connection Failed ", error);
})