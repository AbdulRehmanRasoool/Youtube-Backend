import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const verifyJWT = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken || req.header("Authorization").replace("Bearer ", "");
    
        if (!accessToken) {
            return res.status(401).json(new ApiResponse(false, 401, "Unauthorized"));
        }
        
        const decodedAccessToken = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
        if (!decodedAccessToken) {
            return res.status(401).json(new ApiResponse(false, 401, "Unauthorized"));
        }

        const user = await User.findById(decodedAccessToken.id);
        if (!user) {
            return res.status(401).json(new ApiResponse(false, 401, "Unauthorized"));
        }
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json(new ApiResponse(false, 401, "Unauthorized"));
    }
}

export { verifyJWT }