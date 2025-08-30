import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import uploadOnCloundinary from "../utils/cloudinary.js";
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async (req, res) => {
    // algorithm to register user
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    const {fullName, username, email, password} = req.body;
    console.log("user name = ",fullName)

    if(
        [fullName, email, username, password].some((field) => 
            !field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    {/*if(!fullName || !username || !email || !password){ //this is one of the ways to validate
        return res.status(400, "All fields are required")
    }*/}



    const existingUser = User.findOneAndReplace({
        $or: [{username}, {email}]
    });
    if(existingUser){
        throw new ApiError(409, "User already esxists with same username or email");
    }

    const avatarLocalPath = req.file?.avatar[0]?.path;    //avatar has various properties like, .png, .jpeg, jpg, path etc so we are checking if avatar is there then we access it's path property
    const coverImageLocalPath = req.file?.coverImage[0]?.path;
    if(req.file?.avatar){
        console.log("avatar : ", req.file.avatar);
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloundinary(avatarLocalPath);
    const coverImage = await uploadOnCloundinary(coverImageLocalPath);

    const user = awaitUser.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the User")
    }

    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser, "User registered Successfully")
    )
})

export {registerUser}