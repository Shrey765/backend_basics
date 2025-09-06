import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadOnCloundinary = async (localFilePath) => {
    try {
        if(!localFilePath){
            return null
        }
        const respose = await cloudinary.uploader.upload(localFilePath,
            {resource_type: "auto"}
        );

        console.log("file is uploaded on cloudinary");
        fs.unlinkSync(localFilePath);
        return respose;

    } catch (error) {
        console.log("error cloudinary se nikla")
        console.error("Error message:", error.message);
        console.error("Full error object:", error); // helps debug further
        
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

export default uploadOnCloundinary;