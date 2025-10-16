import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    refreshToken: {
        type: String
    },
    watchHistory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }
}, { timestamps: true });

userSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        await bcrypt.hash(this.password, 10);
    }
    next();
});

export const User = await mongoose.model("User", userSchema);