import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import e from "express";
const app=express();

app.use(cors({
      origin:process.env.CORS_ORIGIN,// for accepting only ours frontend not everyone frontend
      credentials:true,
}));
 
app.use(express.json({limit:"16kb"}));// for accepting the json data in the middleware

app.use(express.urlencoded({extended:true,limit:"16kb"}));// used for handling data from Url or handling url

app.use(express.static("public"))// for putting file folders like images and we want to store it in our server 

app.use(express.cookieParser());

export default app;