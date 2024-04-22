import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import { extractPublicId } from 'cloudinary-build-url'

cloudinary.config({ 
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
    api_key: process.env.CLOUDNARY_API_KEY, 
    api_secret: process.env.CLOUDNARY_API_SECRET
  });

  const deleteImage= async(ImageUrl)=>{

     try {
          if(!ImageUrl){
           return null;
          }
          console.log("Image URL",ImageUrl);
         const publicId =extractPublicId(
            ImageUrl
         )
         console.log("Public ID",publicId);
         const isDeleted= await cloudinary.uploader
         .destroy(publicId);
          
         console.log("isDeleted",isDeleted);
         return isDeleted;  
     } catch (error) {
        console.log(error,"Error while delteing the image");
     }
      
  }

  export{deleteImage}