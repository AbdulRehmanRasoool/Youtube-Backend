import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileRemove, fileUpload } from "../utils/cloudinary.js";

const getUserProfile = async (req, res) => {
    try {
        const response = await sanitizeUserResponse(req.user);
        return res.status(200).json(new ApiResponse(false, 200, "Current user get successfully", response));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const updateUserPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }

        const loggedInUser = req.user;
        const isPasswordValid = await loggedInUser.validatePassword(oldPassword);
        if (!isPasswordValid) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid old password"));
        }

        loggedInUser.password = newPassword;
        await loggedInUser.save();
        return res.status(200).json(new ApiResponse(true, 200, "User password updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const updateUserDetails = async (req, res) => {
    try {
        const { fullName, email, userName } = req.body;
        if ([fullName, email, userName].some(field => !field || !field.trim())) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"))
        }

        const loggedInUser = req.user;  
        const user = await User.findOne({
            $or: [{ email }, { userName }],
            _id: { $ne: loggedInUser.id }
        });

        if (user) {
            return res.status(400).json(new ApiResponse(false, 400, "Username or email already exists"));
        }

        loggedInUser.fullName = fullName;
        loggedInUser.email = email;
        loggedInUser.userName = userName;
        await loggedInUser.save();
        return res.status(200).json(new ApiResponse(true, 200, "User details updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const updateUserAvatar = async (req, res) => {
    try {
        if (!req.files || !req.files?.avatar || !req.files.avatar.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Avatar is required"));
        }
        
        const loggedInUser = req.user;
        const avatar = (await fileUpload(req.files.avatar[0].path)).url;
        const response = await fileRemove(loggedInUser.avatar);
        console.log("File Remove Response", response);

        loggedInUser.avatar = avatar;
        await loggedInUser.save();
        return res.status(200).json(new ApiResponse(true, 200, "User avatar updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const updateUserCover = async (req, res) => {
    try {
        if (!req.files || !req.files?.coverImage || !req.files.coverImage.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Cover image is required"));
        }
        
        const loggedInUser = req.user;
        const coverImage = (await fileUpload(req.files.coverImage[0].path)).url;

        if (loggedInUser?.coverImage) {
            await fileRemove(loggedInUser.coverImage);
        }
        loggedInUser.coverImage = coverImage;
        await loggedInUser.save();
        return res.status(200).json(new ApiResponse(true, 200, "User cover image updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}


const sanitizeUserResponse = async (user) => {
    const { password, refreshToken, __v, ...rest } = user.toObject();
    return rest;
}

export { getUserProfile, updateUserPassword, updateUserDetails, updateUserAvatar, updateUserCover }