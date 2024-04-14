const express = require("express");
const router = express.Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");
const uapload = require("../../middleware/uploade");
const DeleteFiles = require("../../utils/deleteFiles");
const HashingPassword = require("../../middleware/hashPassword");
const cloudinaryRemove = require("../../utils/deleteCloudinary");
const cloudinaryUploading = require("../../utils/uploadCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.put("/" , uapload , async (req , res , next) => {

    try {

        // create user Schema to validate
        const Schema = Joi.object().keys({
            name : Joi.string().min(3).max(50),
            age : Joi.date().min(new Date('1974-01-01')).max(new Date('2004-01-01')),
            password : Joi.string().min(8).max(100),
            images : Joi.array().items(Joi.any()),
            userId : Joi.string().required()
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        // if this body data has problem return error with status code 404
        if (ValidateError.error) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors(ValidateError.error , 404))
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check  if the user id in body equal id in token
        if (req.body.userId != Verify._id) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the user in database by his id 
        const user = await User.findById( Verify._id );

        // check if the user exists
        if (!user) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // update avatar method
        const updateAvatar = async function () {
            // upload the file for cloudinary
            const uploadedFile = await cloudinaryUploading(req.files[0]);

            // delete the image from cloudinary
            if (user.avatar !== process.env.DEFUALT_AVATAR) {
                await cloudinaryRemove(user.avatar);
            }

            // delete avatar from images folder after uploaded
            DeleteFiles(req.files , next);

            // return the new file link
            return uploadedFile;
        }

        // delete user avatar if the request hasnot any file
        const deleteAvatar = async function () {
            // delete the image from cloudinary
            if (user.avatar !== process.env.DEFUALT_AVATAR) {
                await cloudinaryRemove(user.avatar);
            }

            // return defualt avatar 
            return process.env.DEFUALT_AVATAR;
        }

        // find and update user data
        const up = await User.findOneAndUpdate({ _id : Verify._id } , {
            $set : {
                // update the user name if the request has a new user name
                name : req.body.name ? req.body.name : user.name,
                // update the user age if the request has a new age
                age : req.body.name ? req.body.age : user.age,
                // hashing the new password and update the old password if the request has a new password else rturn old password
                password : req.body.password ? await HashingPassword(10 , req.body.password) : user.password,
                // delete the old user avatar and add the new avatar if the request has a avatar
                avatar : req.files.length > 0 ? await updateAvatar() : await deleteAvatar()
            }
        } , { new : true });

        // create result to send it in response
        const result = {
            "message" : "User Data Updated Successfully",
            "user_info" : _.pick(up , ['_id' , 'avatar' , 'name' , 'age' , 'email' , '_id' , 'joined_at'])
        }

        // send the response
        res.status(200).send(result);

    } catch(error) {
        DeleteFiles(req.files , next);
        return next(new ApiErrors(error , 500));
    } 
});

module.exports = router;