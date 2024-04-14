const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({path : '../confige.env'});

const upload = require("../../middleware/uploade");
const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");
const DeleteFiles = require("../../utils/deleteFiles");
const GenerateToken = require("../../middleware/generateToken");
const HashingPassword = require("../../middleware/hashPassword");
const cloudinaryUploading = require("../../utils/uploadCloudinary");


router.post("/" , upload , async (req , res , next) => {

    try {

        // create user schema 
        const Schema = Joi.object().keys({
            name: Joi.string().min(3).max(50).required(),
            age: Joi.date().min(new Date('1974-01-01')).max(new Date('2004-01-01')).required(),
            email: Joi.string().min(10).max(30).required().email(),
            password: Joi.string().min(8).max(100).required(),
            avatar : Joi.array().items(Joi.any()),
        });

        // validate userdata usin joi Schema
        const ValidateError = Schema.validate(req.body);

        // if user data has a problem return error with status code 404
        if (ValidateError.error) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors(ValidateError.error , 404))
        }

        // check if the request's images length is bigger than 1 return error
        if (req.files.length > 1) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("You can upload only one image ..." , 403));
        }

        // getting the user by id 
        const existsUser = await User.findOne({ email : req.body.email });

        // check if the user exists
        if (existsUser) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("The Email Is Already Used ..." , 403));
        }

        // upload the file for cloudinary
        const uploadfile = await cloudinaryUploading(req.files[0]);

        // create new user object
        const user = new User({
            name : req.body.name,
            age : req.body.age,
            email : req.body.email,
            password : await HashingPassword(10 , req.body.password),
            avatar : req.files.length > 0 ? uploadfile : process.env.DEFUALT_AVATAR
        });

        // delete the avatar after uploaded it in cloudinary
        DeleteFiles(req.files , next);

        // Save user in database 
        await user.save();

        // Generate token from user data
        const token = GenerateToken(user._id , user.email);

        // create a result 
        const result = {
            "user_info" : _.pick(user , ['_id' , 'avatar' , 'name' , 'age' , 'email' , 'joined_at']),
            "token" : token
        };

        // Send response to user 
        res.status(200).send(result);

    } catch(error) {
        DeleteFiles(req.files , next);
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;