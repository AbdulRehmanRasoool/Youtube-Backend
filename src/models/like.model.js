import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "comments"
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "videos"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
}, { timestamps: true });

export const Like = mongoose.model("Like", likeSchema);