import bcrypt from "bcryptjs"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/userModel.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"; 
import generateAccessAndRefereshTokens from "../utils/tokenGenerator.js";


// @Desc Get All User | public
// Methods GET /api/v1/users 
const getUsers = asyncHandler( async (req, res) => {
    try {
      const users = await User.find({}).select("-password -refreshToken"); 
      return res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } 
 );



// @Desc User Registration | Public Route ❤️
// @Methods POST /api/v1/users/register 
const registerUser = asyncHandler( async (req, res) => {

    const {firstName, lastName,email, password } = req.body
   // console.log("email: ", email,password);

    if ( [firstName,lastName,email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    };

    const existedUser = await User.findOne({email});

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    

    const avatarLocalPath = req.files?.avatar[0]?.path;
    
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    };

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
  
    const hashedPass = await bcrypt.hash(password,10);
    
    const user = await User.create({
        firstName, 
        lastName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password:hashedPass,
        
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    console.log(createdUser)
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );

});

// @Desc User Login | Public Route ❤️
// @Methods POST /api/v1/users/login 
const loginUser = asyncHandler(async(req,res)=>{
 try{
  // req body -> data 
  const {email,password} = req.body;  
  // check email empty  or not 
  if(!email){
    throw new ApiError(400,"Email or Password required ");
  };
  //find the user in db using email  
  const user = await User.findOne({email}); 
  
  //check user's existence  
  if(!user){
    throw new ApiError(400,"User does not exist!");
  };
  //password check 
  const isPasswordValid = await user.isPasswordCorrect(password); 
  if(!isPasswordValid){
    throw new ApiError(401,"Invalid user ccredentials");
  };
  //generate access and referesh token 
  const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id);
  
  const loggedInUser = await User.findById(user._id).select(`-password
   -refreshToken`); 
   
  const options = { 
    maxAge: 60*60*24*30,// 30 day's 
    httpOnly:true,
    secure:false
  }; 
  
  
  return (
    res.cookie("accessToken", accessToken, options),
    res.cookie("refreshToken", refreshToken, options),
    res.status(200).json(
        new ApiResponse(
              200, 
              {
                  user: loggedInUser, accessToken, refreshToken
              },
              "User logged In Successfully"
          )
      )
  );
 }catch(error){
   console.log("Login error! 😭",error)
   return res.status(500).json({ message: 'Internal Server Error' });
 };
});

// @Desc Logout User | Protected Route ❤️
// @Methods /api/v1/users/logout 
const logoutUser = asyncHandler( async (req,res)=>{
   
   await User.findByIdAndUpdate(
     req?.user?._id,
     {
      $set: { refreshToken:null}
     },
     { new:true }
   ); 
   
   const options = { 
     httpOnly:true,
     secure:false
   }; 
   
   return(
      res.clearCookie("accessToken","",options),
      res.clearCookie("refreshToken","",options),
      res.status(200).json(
         new ApiResponse(200,{},"User Logged Out!")
        )
     );
});



export { 
    getUsers,
    registerUser,
    loginUser,
    logoutUser
}