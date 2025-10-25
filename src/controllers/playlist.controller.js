import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js"; 

const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }
        const loggedInUser = req.user;

        const playlist = await Playlist.create({
            name,
            description,
            videos,
            owner: loggedInUser._id    
        });
        return res.status(200).json(new ApiResponse(true, 200, "Playlist created successfully", playlist));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "An error has occured"));
    }
}

const getUserPlayist = async (req, res) => {
    try {
        const { userId } = req.params.userId;
        if (!userId) {
            return res.status(400).json(new ApiResponse(false, 400, "User id is required"));
        }

        const playlists = await Playlist.aggregate([
            {
                $match: {
                    owner: userId
                },
                $lookup: {
                    from: "videos",
                    foreignField: "_id",
                    localField: "videos",
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
                                            fullName: 1,
                                            userName: 1,
                                            email: 1,
                                            avatar: 1
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
                    ]
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(true, 200, "Playlist get successfully", playlists));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const getPlaylistById = async (req, res) => {
    try {
        const { playlistId } = req.params.playlistId;
        if (!playlistId) {
            return res.status(400).json(new ApiResponse(false, 400, "Playlist id is required"));
        }

        const playlist = await Playlist.aggregate([
            {
                $match: {
                    _id: playlistId
                }
            },
            {
                $lookup: {
                    from: "videos",
                    foreignField: "_id",
                    localField: "videos",
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
                                            fullName: 1,
                                            userName: 1,
                                            email: 1,
                                            avatar: 1
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
                    ]
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(true, 200, "Playlist get successfully", playlist));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const addVideoToPlaylist = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const videoId = req.params.videoId;

        if (!playlistId || !videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }

        const playlist = await Playlist.findById(playlistId);
        const video = await Video.findById(videoId);

        if (!playlist) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid playlist id"));
        }
        if (!video) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid video id"));
        }

        playlist.videos.push(videoId);
        await playlist.save();
        return res.status(200).json(new ApiResponse(true, 200, "Video added to playlist successfully"));
    } catch (error) {
        console.error(error)
        return res.status(500).json(new ApiResponse(false, 500, "Somethiing went wrong"));
    }
}

const removeVideoFromPlaylist = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const videoId = req.params.videoId;

        if (!playlistId || !videoId) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }

        const playlist = await Playlist.findOne({
            $and: [
                {_id: playlistId},
                {videos: videoId}
            ]
        });

        if (!playlist) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid playlist id"));
        }
        
        playlist.videos.pull(videoId);
        await playlist.save();
        return res.status(200).json(new ApiResponse(true, 200, "video remove from playlist successfully"));
    } catch (error) {
        console.error(error)
        return res.status(500).json(new ApiResponse(false, 500, "Somethiing went wrong"));
    }
}

const deletePlaylist = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        if (!playlist) {
            return res.status(400).json(new ApiResponse(false, 400, "Playlist id is required"));
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid playlist id"));
        }

        await Playlist.deleteOne(playlistId);
        return res.status(200).json(new ApiResponse(true, 200, "Playlist remove successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const updatePlaylist = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const { name, description } = req.body;
        if (!playlist) {
            return res.status(400).json(new ApiResponse(false, 400, "Playlist id is required"));
        }

        if (!name || !description) {
            return res.status(400).json(new ApiResponse(false, 400, "All fields are required"));
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid playlist id"));
        }

        playlist.name = name;
        playlist.description = description;
        await playlist.save();
        return res.status(200).json(new ApiResponse(true, 200, "Playlist updated successfully"));

    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

export { createPlaylist, getUserPlayist, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist};