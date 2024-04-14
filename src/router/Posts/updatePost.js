const express = require("express");
const router = express.Router();
const Joi = require("joi"); 
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });


const Post = require("../../models/post/post");
const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");

const upload = require("../../middleware/uploadpostfiles.js");
const DeleteFiles = require("../../utils/deleteFiles");
const cloudinaryUploading = require("../../utils/uploadCloudinary");
const cloudinaryRemove = require("../../utils/deleteCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.put("/" , upload ,  async (req , res , next) => {

    try {

        // create Schema to check the body data if has a problem
        const Schema = Joi.object().keys({
            title : Joi.string().min(1).max(200),
            images : Joi.array().min(1).max(5).items(Joi.any()),
            postId : Joi.string().required(),
            userId : Joi.string().required()
        });

        // validate body data using created Schema
        const validateError = Schema.validate(req.body);

        // check if the body data has a problem return error
        if (validateError.error) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors(validateError.error , 400))
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user exists or not
        if (!user) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id is eqaul id in token
        if (req.body.userId != Verify._id) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the post by his id
        const oldPost = await Post.findById(req.body.postId);

        // check if the post exists
        if (!oldPost) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid Post Not Found ..." , 404));
        }

        // update images array
        const UpdateImages = async function (oldfiles) {
            let images = [];
            // check if the request files length is bugger thane 0
            if (req.files.length > 0) {
                // delete old post's images
                oldfiles.forEach(async image => {
                    // delete the image from cloudinary
                    await cloudinaryRemove(image);
                });

                // upload the new images
                for (let i = 0; i < req.files.length; i++) {
                    const uploadedfile = await cloudinaryUploading(req.files[i]);

                    // return the urls
                    images.push(uploadedfile);
                } 
            };

            // delete the images from images folder
            DeleteFiles(req.files , next);

            // return the image array to replace it with the B image array
            return images;
        }

        // emptying old post images array
        const DeleteOldImages = function (oldimages) {
            if (oldimages.length > 0) {
                oldimages.forEach(async image => {
                    // delete the image from 
                    await cloudinaryRemove(image);
                });
            }

            // return an empty array to replace it with the post images array
            return []
        }

        // check if the post author equal the user id from token in headers
        if (Verify._id != oldPost.created_by) {
            return next(new ApiErrors("You Cann't access to this post ..." , 500));
        }

        // getting the post by ib from database
        const post = await Post.findByIdAndUpdate(req.body.postId , {
            $set : {
                title : req.body.title ? req.body.title : oldPost.title,
                images : req.files.length > 0 
                ? await UpdateImages(oldPost.images) 
                : await DeleteOldImages(oldPost.images)
            }
        } , { new : true });

        // create a result
        const result = {
            "message" : "Post updated successfully",
            "post" : post
        }

        // send the post in response 
        res.status(200).send(result);

    } catch (error) {
        DeleteFiles(req.files , next)
        return next(new ApiErrors(error , 500));
    }
});


module.exports = router;