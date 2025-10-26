import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileRemove, fileUpload } from "../utils/cloudinary.js";

const getUserProfile = async (req, res) => {
    try {
        const response = await sanitizeUserResponse(req.user);
        return res.status(200).json(new ApiResponse(false, 200, "User profile get successfully", response));
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
        if (!req?.file) {
            return res.status(400).json(new ApiResponse(false, 400, "Avatar is required"));
        }

        const loggedInUser = req.user;
        const avatar = (await fileUpload(req.file.path)).url;
        await fileRemove(loggedInUser.avatar);
        
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
        if (!req?.file) {
            return res.status(400).json(new ApiResponse(false, 400, "Cover image is required"));
        }
        
        const loggedInUser = req.user;
        const coverImage = (await fileUpload(req.file.path)).url;

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

const getUserWatchHistory = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const videos = await User.aggregate([
            {
                $match: {
                    _id: loggedInUser._id
                }
            },
            {
                $lookup: {
                    from: "videos",
                    foreignField: "owner",
                    localField: "watchHistory",
                    as: "videos",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                foreignField: "_id",
                                localField: "owner",
                                as: "channel",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            userName: 1,
                                            email: 1,
                                            avatar: 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1,
                                thumbnail: 1,
                                videoFile: 1,
                                duration: 1,
                                channel: 1
                            }
                        },
                        {
                            $addFields: {
                                channel: {
                                    $arrayElemAt: ["$channel", 0]
                                }
                            }
                        }
                    ]
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(true, 200, "User watch history get successfully", videos));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const getUserChannelProfile = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            return res.status(400).json(new ApiResponse(false, 400, "Username is required"));
        }

        const user = await User.aggregate([
            {
                $match: {
                    userName: username
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    foreignField: "channel",
                    localField: "_id",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    foreignField: "subscriber",
                    localField: "_id",
                    as: "subscribedCount"
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(true, 200, "User profile get successfully", user));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "An error has occured"));
    }
}

const sanitizeUserResponse = async (user) => {
    const { password, refreshToken, __v, ...rest } = user.toObject();
    return rest;
}

export { getUserProfile, updateUserPassword, updateUserDetails, updateUserAvatar, updateUserCover }