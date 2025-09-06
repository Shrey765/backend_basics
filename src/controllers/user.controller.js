import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import uploadOnCloundinary from "../utils/cloudinary.js";
import {ApiResponse} from '../utils/ApiResponse.js'

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "No user found with this id");
        }
        const accessToken = user.generateAccessToken();
        console.log("Access Token = ", accessToken);
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
}

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
    console.log("user name = ", fullName);
    console.log("user email = ", email);
    console.log("user username = ", username);
    console.log("user password = ", password);

    if(
        [fullName, email, username, password].some((field) => !field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    {/*if(!fullName || !username || !email || !password){ //this is one of the ways to validate
        return res.status(400, "All fields are required")
    }*/}



    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    });
    if(existingUser){
        throw new ApiError(409, "User already esxists with same username or email");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;    //avatar has various properties like, .png, .jpeg, jpg, path etc so we are checking if avatar is there then we access it's path property
    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){ // we can also do this check for avatar as well !!
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloundinary(avatarLocalPath);
    const coverImage = await uploadOnCloundinary(coverImageLocalPath);
    console.log("avatar = ", avatar);
    console.log("coverImage = ", coverImage);

    const user = await User.create({
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

const loginUser = asyncHandler(async (req, res) => {
    // algorithm to login user
    //req body se data leke ao (email, username, password)
    // find user
    // password check
    // access token, refresh token
    // send cookies
    const {email, username, password} = req.body;

    if(!username && !email){
        throw new ApiError(400, "username or email is required to login");
    }

    const actualUser = await User.findOne({$or: [{email}, {username}]});
    if(!actualUser){
        throw new ApiError(404, "No user found with this email or username");
    }

    const isPasswordMAtch = await actualUser.isPasswordCorrect(password);
    if(!isPasswordMAtch){
        throw new ApiError(401, "Password is incorrect");
    } 

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(actualUser._id);
    const user = await User.findById(actualUser._id).select("-password -refreshToken");
    
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: user,
            accessToken,
            refreshToken
        },
        "User logged in successfully"
        )
    )
})

const logOutUser = asyncHandler( async (req, res) => {
    // logout algorithm
    // get user id from req.user
    await User.findByIdAndUpdate(req.user._id, {refreshToken: ""}, {new: true});

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json( new ApiResponse(200, {}, "User logged out successfully") )
})

export {registerUser, loginUser, logOutUser}