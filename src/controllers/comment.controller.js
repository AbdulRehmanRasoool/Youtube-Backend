import { ApiResponse } from "../utils/ApiResponse";
import { Comment } from "../models/comment.model.js";

const getComments = async (req, res) => {
    try {
        const { videoId } = req.params;
        if (!videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "Video id is required"));
        }

        const comments = await Comment.aggregate([
            {
                $match: {
                    videoId: videoId
                }
            },
            {
                $lookup: {
                    from: "users",
                    foreignField: "_id",
                    localField: "owner",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                email: 1,
                                userName: 1,
                                avatar: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $arrayElemAt: ["$owner", 0]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    video: 1,
                    owner: 1
                }
            }
        ]);

        return res.status(200).json(new ApiResponse(true, 200, "Comments get successfully", comments));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const videoId = req.params.videoId;
        if (!videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "Video id is required"));
        }

        if (!content) {
            return res.status(400).json(new ApiResponse(false, 400, "Content is required"));
        }

        const loggedInUser = req.user;
        const comment = await Comment.create({
            content,
            video: videoId,
            owner: loggedInUser._id
        });
        return res.status(200).json(new ApiResponse(true, 200, "Comment created successfully", comment));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"))
    }
}

const updateComment = async (req, res) => {
    try {
        const { content } = req.body;
        const commentId = req.params;

        if (!content || !commentId) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }

        const comment = await Comment.findOne({
            $and: [{_id: commentId}, {owner: req.user._id}]
        });
        if (!comment) {
            return res.status(false, 400, "Invalid comment id");
        }

        comment.content = content;
        await comment.save();
        return res.status(200).json(new ApiResponse(true, 200, "Comment id get successfully", comment));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const deleteComment = async (req, res) => {
    try {
        const commentId = req.params;
        if (!commentId) {
            return res.status(400).json(new ApiResponse(false, 400, "Comment id is required"));
        }

        const comment = await Comment.findOne({
            $and: [{_id: commentId}, {owner: req.user._id}]
        });
        if (!comment) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid comment id"));
        }

        await Comment.deleteOne({
            _id: commentId
        });
        return res.status(200).json(new ApiResponse(true, 200, "Comment deleted successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

export { getComments, createComment, updateComment, deleteComment }