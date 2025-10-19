import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const fileUpload = async (filePath) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_SECRET_KEY
        });
        const response = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });
        fs.unlinkSync(filePath);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        console.error("Cloudinary file upload error", error);
        throw error;
    }
}

const fileRemove = async (filePath) => {
    try {
        
        const response = await cloudinary.uploader.destroy(filePath);
        fs.unlinkSync(filePath);
        return response;
    } catch (error) {
        fs.unlinkSync(filePath);
        console.error("Cloudinary file upload error", error);
        throw error;
    }
}

export { fileUpload, fileRemove }