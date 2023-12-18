import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express(); 

app.use(
  cors({
    origin: 'http://localhost:5173', // Specify the allowed origin(s)
    credentials: true, // Allow credentials (cookies, headers, etc.)
  })
);


app.use(express.json({limit:"10mb"}));
app.use(express.urlencoded({extended:true,limit:"10mb"}));
app.use(cookieParser());

// Routes imports 
import userRouter from "./routes/userRoutes.js"; 


// Routes Declaration 
app.use("/api/v1/users",userRouter); 


export {app};