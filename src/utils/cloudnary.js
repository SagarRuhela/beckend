import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
  api_key: process.env.CLOUDNARY_API_KEY, 
  api_secret: process.env.CLOUDNARY_API_SECRET
});

// file upload is ricksy task so we are going the use  the try catch to make the file upload 

const uploadOnCloudnary= async (localFilePath)=>{
 try {
    if(!localFilePath){
        return null;
    }
    const res= await cloudinary.uploader.upload(localFilePath,{
        resource_type:'auto',
    });
    console.log("file is uploaded in the cloudnary",res.url);
    return res;

    
 } catch (error) {
    fs.unlinkSync(localFilePath);// here we unlinking/ deleting the file from our local server which is not being uploaded in cloundnary
    return null;
 }
}

export {uploadOnCloudnary};





