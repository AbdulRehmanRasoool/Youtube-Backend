import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileUpload } from "../utils/cloudinary.js";
import { cookieAccessToken, cookieOptions, cookieRefreshToken } from "../constants.js";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
    try {
        const { fullName, userName, email, password } = req.body;
        
        if ([fullName, userName, email, password].some(field => !field || !field.trim())) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }

        let user = null;
        user = await User.findOne({
            $or: [{email}, {userName}]
        });

        if (user) {
            return res.status(400).json(new ApiResponse(false, 400, "Username or email already exists"));
        }
        
        if (!req.files || !req.files?.avatar || !req.files?.avatar?.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Avatar is required"));
        }

        const avatar = (await fileUpload(req.files.avatar[0].path)).url;
        let coverImage = null;
        if (req.files?.coverImage && req.files?.coverImage?.length > 0) {
            coverImage = (await fileUpload(req.files.coverImage[0].path)).url;
        }
        user = await User.create({
            fullName,
            userName, 
            email, 
            password,
            avatar,
            coverImage
        });
        const response = await sanitizeAuthResponse(user);
        return res.status(200).json(new ApiResponse(true, 200, "User registered successfully", response));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json(new ApiResponse(false, 400, "Username or email is required"));
        }

        if (!password) {
            return res.status(400).json(new ApiResponse(false, 400, "Password is required"))
        }
        let user = null;
        user = await User.findOne({
            $or: [{userName: email}, {email}]
        });

        if (!user) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid user credentials"))
        }

        const isPasswordValid = await user.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid user credentials"));
        }
        
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();

        const response = await sanitizeAuthResponse(user);
        return res.status(200).cookie(cookieAccessToken, accessToken, cookieOptions).cookie(cookieRefreshToken, refreshToken, cookieOptions).json(new ApiResponse(true, 200, "User login successfully", {
            user: response,
            accessToken,
            refreshToken
        }));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $unset: {
                refreshToken: ""
            }
        }, {
            returnDocument: "after"
        });
        return res.status(200).clearCookie(cookieAccessToken, cookieOptions).clearCookie(cookieRefreshToken, cookieOptions).json(new ApiResponse(true, 200, "User logout successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json(new ApiResponse(false, 400, "Refresh token is required"));
        }

        const decodedRefreshToken = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
        if (!decodedRefreshToken) {
            return res.status(401).json(new ApiResponse(false, 401, "Unauthorized"));
        }
        
        const user = await User.findById(decodedRefreshToken.id);
        if (!user) {
            return res.status(401).json(new ApiResponse(false, 401, "Unauthorized"));
        }

        if (refreshToken !== user.refreshToken) {
            return res.status(401).json(new ApiResponse(false, 401, "Unauthorized"));
        }

        const accessToken = await user.generateAccessToken();
        const newRefreshToken = await user.generateRefreshToken();

        user.refreshToken = newRefreshToken;
        await user.save();
        const response = await sanitizeAuthResponse(user);
        return res.status(200).cookie(cookieAccessToken, accessToken, cookieOptions).cookie(cookieRefreshToken, newRefreshToken, cookieOptions).json(new ApiResponse(true, 200, "Refresh access token generate successfully", {
            user: response,
            accessToken,
            refreshToken: newRefreshToken
        }));
    } catch (error) {
        console.error(error);
        return res.status(401).json(new ApiResponse(false, 401, "Unauthorized"));
    }
}

const sanitizeAuthResponse = async (user) => {
    const { password, refreshToken, __v, ...rest } = user.toObject();
    return rest;
}

export { register, login, logout, refreshAccessToken }