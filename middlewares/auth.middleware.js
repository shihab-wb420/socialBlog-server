import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
const {verify} = jwt;

export const verifyJWT = asyncHandler(async(req, _, next) => { 
 // console.log("inside logout | auth middle ware", await req?.cookies?.accesssToken)
    try {
       const token = await req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
       
        console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = await verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            // NEXT_VIDEO: discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
}) 
