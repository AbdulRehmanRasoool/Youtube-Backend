import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStats = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const totalSubscribers = await Subscription.countDocuments({
            channel: loggedInUser._id
        });
        const videos = await Video.aggregate([
            {
                $match: {
                    owner: loggedInUser._id
                }
            },
            {
                $lookup: {
                    from: "likes",
                    foreignField: "video",
                    localField: "_id",
                    as: "likes",
                }
            },
            {
                $count: "$likes"
            }
        ]);
        const response = {
            totalSubscribers,
            videos
        };
        return res.status(200).json(new ApiResponse(true, 200, "User stats get successfully", response));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const getChannelVideos = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const pageNumber = Number(req.query.pageNumber);
        const pageSize = Number(req.query.pageSize);
        const skip = (pageNumber - 1) * pageSize;
        const videos = await Video.aggregate([
            {
                $match: {
                    owner: loggedInUser._id
                }
            },
            {
                $skip: skip
            },
            {
                $limit: pageSize
            }
        ]);
        return res.status(200).json(new ApiResponse(true, 200, "Channel videos get successfully", videos));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

export { getChannelStats, getChannelVideos }