import { Router } from "express";
import {  getUsers, registerUser, loginUser, logoutUser} from "../controllers/userController.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()


router.route("/get").get(getUsers) // url:- /api/v1/users

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    ); // url:- /api/v1/users/register

router.route("/login").post(loginUser) // url:- /api/v1/users/login

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser) // url:- /api/v1/users/logout


export default router