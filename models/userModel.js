import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; 
const {sign} = jwt;

const userSchema = new mongoose.Schema({ 
  firstName:{
    type:String,
    required:true,
    trim:true,
  },
  lastName:{
    type:String,
    required:true,
    trim:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
  },
  password:{
    type:String,
    required:[true,"Password is required"],
    unique:true,
    trim:true,
  }, 
  refreshToken:{
    type:String,
  },
  avatar:{
    type:String, //Cloudinary url
    
  },
  coverImage:{
    type:String, //Cloudinary url
  },
  
  
},{timestamps:true});


// Hashing password before saving in Database
/*userSchema.pre("save",(next)=>{
  if(!this.isModified("password")) return next(); 
  
  this.password = bcrypt.hash(this.password,10); 
  next();
});*/

// creating methods isPasswordCorrect for comparing password 
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password,this.password);
};

// creating methods generateAccessToken 
userSchema.methods.generateAccessToken = async function(){
  return await sign(
       {
         _id:this._id,
         firstName:this.firstName,
         lastName:this.lastName,
         email:this.email,
       }, 
       process.env.ACCESS_TOKEN_SECRET,
       {
         expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
       },
   );
};

// creating methods generateRefreshToken 
userSchema.methods.generateRefreshToken = async function(){
  return sign(
     {
       _id: this._id,
     },
     process.env.REFRESH_TOKEN_SECRET,
     {
       expiresIn: process.env.REFRESH_TOKEN_EXPIRY
     }
    );
};


export const User = mongoose.model("User",userSchema);