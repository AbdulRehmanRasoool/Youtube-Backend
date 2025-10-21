import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileRemove, fileUpload } from "../utils/cloudinary.js";

const getVideos = async (req, res) => {
    try {
        // TODO: response => thumbnail, title, views, createdAt, duration, avatar, username, email, fullName
        const pageNumber = req.query.pageNumber;
        const pageSize = req.query.pageSize;

        if (!pageNumber || !pageSize) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }

        console.log(pageNumber);
        console.log(typeof(pageSize));

        const skip = Number((pageNumber - 1) * pageSize);
        const limit = Number(pageSize);
        const search = req.query.search;
        console.log(search);
        const videos = await Video.aggregate([
            {
                $match: {
                    title: { $regex: search, $options: "i"}
                }
            },
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
                $skip: skip
            },
            {
                $limit: limit
            }
        ]);
        console.log(videos);
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const publishVideo = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }
    
        if (!req.files || !req.files?.thumbnail || !req.files?.thumbnail?.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Thumbnail is required"));
        }
    
        if (!req.files || !req.files?.content || !req.files?.content?.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Content is required"));
        }
    
        const thumbnail = (await fileUpload(req.files.thumbnail[0].path)).url;
        const content = (await fileUpload(req.files.content[0].path));
        const loggedInUser = req.user;
        await Video.create({
            title,
            description,
            videoFile: content.url,
            thumbnail,
            duration: content.duration,
            owner: loggedInUser._id
        });
        return res.status(200).json(new ApiResponse(true, 200, "Video published successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const getVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "Video id is required"));
        }

        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid video id format"));
        }
        
        const video = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId)
                }
            },
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
                $addFields: {
                    channel: {
                        $arrayElemAt: ["$channel", 0]
                    }
                }
            },
            {
                $project:{
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    isPublished: 1,
                    channel: 1
                }
            }
        ]);

        if (!video || !video.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid video id"));
        }

        return res.status(200).json(new ApiResponse(true, 200, "Video get successfully", video));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const updateVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "Vidoe id is required"));
        }

        const { title, description } = req.body;
        if ([title, description].some(field => !field || !field.trim())) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }

        const video = await Video.findOne({
            $and: [{_id: videoId}, {owner: req.user._id}]
        });
        if (!video) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid video id"));
        }
        
        if (req.file) {
            const thumbnail = (await fileUpload(req.file.path)).url;
            await fileRemove(video.thumbnail);
            video.thumbnail = thumbnail;
        }

        video.title = title;
        video.description = description;
        await video.save();
        return res.status(200).json(new ApiResponse(true, 200, "Video updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "Vidoe id is required"));
        }

        const video = await Video.findOne({
            $and: [{_id: videoId}, {owner: req.user._id}]
        });
        if (!video) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid video id"));
        }

        await fileRemove(video.content);
        await fileRemove(video.thumbnail);
        await Video.deleteOne(videoId);
        return res.status(200).json(new ApiResponse(true, 200, "Video deleted successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const updateVideoStatus = async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "Vidoe id is required"));
        }

        const video = await Video.findOne({
            $and: [{_id: videoId}, {owner: req.user._id}]
        })
        if (!video) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid video id"));
        }

        video.isPublished = !video.isPublished;
        await video.save();
        return res.status(200).json(new ApiResponse(true, 200, "Vidoe status updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

export { getVideos, publishVideo, getVideo, updateVideo, deleteVideo, updateVideoStatus };