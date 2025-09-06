import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler( async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.get("authorization")?.replace("Bearer ", "");
        if(!token){
            throw new ApiError(401, "Not authorized, token is missing");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decodedToken){
            throw new ApiError(401, "Not authorized, token is invalid");
        }
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
})