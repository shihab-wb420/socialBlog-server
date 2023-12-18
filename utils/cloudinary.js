import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: 'unity-it', 
  api_key: '863787279714991', 
  api_secret:'hSAGUdtaV-_hOW4G3BywNekO7Qw'
});

const uploadOnCloudinary = async (localFilePath) => {
    try { 
      
        if (!localFilePath) return null
        //upload the file on cloudinary valdi 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        
        return response;

    } catch (error) {
        console.log("error inside cloudinary")
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}



export {uploadOnCloudinary}