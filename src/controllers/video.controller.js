import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { fileUpload } from "../utils/cloudinary.js";

const getVideos = async (req, res) => {
    try {
        // TODO: response => thumbnail, title, views, createdAt, duration, avatar, username, email, fullName
        const pageNumber = req.params.pageNumber;
        const pageSize = req.params.pageSize;
        const query = req.params.query;
        const videos = await Video.aggregate([
            {
                $match: {
                    title: `/${query}/`
                }
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
    
        if (!req.files || !req.files?.thumnail || !req.files?.thumnail?.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Thumbnail is required"));
        }
    
        if (!req.files || !req.files?.content || !req.files?.content?.length > 0) {
            return res.status(400).json(new ApiResponse(false, 400, "Content is required"));
        }
    
        const thumbnail = (await fileUpload(req.files.thumbnail[0].path)).url;
        const content = (await fileUpload(req.files.content[0].path));

        const video = await Video.create({
            title,
            description,
            videoFile: content.url,
            thumbnail,
            duration: content.duration
        });
        return res.status(200).json(new ApiResponse(true, 200, "Video published successfully", video));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const getVideo = async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        return res.status(400).json(new ApiResponse(false, 400, "Video id is required"));
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: videoId
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "channel"
            }
        },
        {
            $lookup: {
                from: "comments",
                foreignField: "_id",
                
            }
        }
    ])
}

export { getVideos, publishVideo }