import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileUpload } from "../utils/fileUpload.js";

const registerUser = async (req, res) => {
    try {
        const { fullName, userName, email, password } = req.body;
        Array(fullName, userName, email, password).some((field) => {
            if (!field || !field.trim()) {
                return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
            }
        });

        const user = await User.findOne({
            $or: [{email}, {userName}]
        });

        if (user) {
            return res.status(400).json(new ApiResponse(false, 400, "Username or email already exists"));
        }

        if (!req.files || !req.files.avatar || !req.files.avatar.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Avatar is required"));
        }

        const avatar = await fileUpload(req.files[0].avatar.path);
        let coverImage;

        if (!req.files.coverImage || !req.files.coverImage.length > 0) {
            coverImage = await fileUpload(req.files[0].coverImage.path);
        }
        
        user = await User.create({
            fullName,
            userName, 
            email, 
            avatar,
            coverImage
        });

        user.refreshToken = undefined;
        user.__v = undefined;
        user.password = undefined;

        return res.status(200).json(new ApiResponse(true, 200, "User registered successfully", user));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}