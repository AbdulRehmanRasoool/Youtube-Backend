import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = async (req, res) => {
    try {
        const { channelId } = req.params.channelId;
        const loggedInUser = req.user;
        if (!channelId) {
            return res.status(400).json(new ApiResponse(false, 400, "Channel id is required"));
        }

        const channel = await User.findById(channelId);
        if (!channel) {
            return res.status(400).json(new ApiResponse(false, 400, "Invalid channel id"));
        }

        const subscription = await Subscription.findOne({
            $and: [
                {channel: channelId},
                {subscriber: loggedInUser._id}
            ]
        });

        if (subscription) {
            await Subscription.deleteOne({
                _id: subscription._id
            });
        }
        else{
            await Subscription.create({
                subscriber: loggedInUser._id,
                channel: channelId
            });
        }

        
        return res.status(200).json(new ApiResponse(true, 200, "Subscription updated successfully"));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"))
    }
}

const getUserChannelSubscribers = async (req, res) => {
    try {
        const { channelId } = req.params.channelId;
        if (!channelId) {
            return res.status(400).json(new ApiResponse(false, 400, "Channel id is required"));
        }

        const subscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: channelId
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "subscribers",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                email: 1,
                                avatar: 1,
                                userName: 1
                            }  
                        }
                    ]
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(true, 200, "Subscirbers get successfully", subscribers));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

const getSubscribedChannel = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const channels = await Subscription.aggregate([
            {
                $match: {
                    subscriber: loggedInUser._id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriber",
                    foreignField: "_id",
                    as: "channels",
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                email: 1,
                                avatar: 1,
                                userName: 1
                            }  
                        }
                    ]
                }
            }
        ]);
        return res.status(200).json(new ApiResponse(true, 200, "User subscribed channel get successfully", channels));
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ApiResponse(false, 500, "Something went wrong"));
    }
}

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannel };