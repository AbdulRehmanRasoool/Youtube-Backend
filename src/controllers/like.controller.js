import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const loggedInUser = req.user;
        if (!videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "Video id is required"));
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid video id"));
        }

        const like = await Like.findOne({
            $and: [
                {video: videoId},
                {likedBy: loggedInUser._id}
            ]
        });

        console.log("Like", like);
        console.log("Like1", !like);

        if (!like) {
            await Like.create({
                video: videoId,
                likedBy: loggedInUser._id
            });
        }
        else {
            await Like.deleteOne({
                _id: like._id
            });
        }
        return res.status(200).json(new ApiResponse(true, 200, "Video like updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"))
    }   
}

const toggleCommentLike = async (req, res) => {
    try {
        const commentId = req.commentId;
        const loggedInUser = req.user;
        if (!commentId) {
            return res.status(400).json(new ApiResponse(false, 400, "Comment id is required"));
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid comment id"));
        }

        const like = await Like.findOne({
            $and: [
                {comment: commentId},
                {likedBy: loggedInUser._id}
            ]
        });

        if (!like) {
            Like.create({
                comment: commentId,
                likedBy: loggedInUser._id
            });
        }
        else {
            Like.deleteOne({
                _id: like._id
            });
        }
        return res.status(200).json(new ApiResponse(true, 200, "Comment like updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const getLikeVideos = async (req, res) => {
    try {
        const loggedInUser = await req.user;
        const likeVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: loggedInUser._id
                }
            },
            {
                $lookup: {
                    from: "videos",
                    foreignField: "_id",
                    localField: "video",
                    as: "videos",
                    pipeline: [
                        {
                            $match: {
                                isPublished: true
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
                                            _id: 1,
                                            userName: 1,
                                            fullName: 1,
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
                                videoFile: 1,
                                thumbnail: 1,
                                duration: 1,
                                createdAt: 1,
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
            },
            {
                $project: {
                    _id: 0,
                    videos: 1
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(true, 200, "Like videos get successfully", likeVideos[0]));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

export { toggleVideoLike, toggleCommentLike, getLikeVideos }