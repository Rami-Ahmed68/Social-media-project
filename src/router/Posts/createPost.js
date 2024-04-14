const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _  = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const upload = require("../../middleware/uploadpostfiles");
const ApiErrors = require("../../utils/apiErrors");
const DeleteFiles = require("../../utils/deleteFiles");
const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const cloudinaryUploading = require("../../utils/uploadCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.post("/" , upload , async (req , res , next) => {

    try {
        // create post Schema to validate post data
        const Schema = Joi.object().keys({
            title : Joi.string().min(1).max(200).required(),
            images : Joi.array().min(1).max(5).items(Joi.any()),
            userId : Joi.string().required()
        });

        // validate post data using Schema 
        const ValidateError = Schema.validate(req.body);

        // if post data has a problem return error with his error details and status code 404
        if (ValidateError.error) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors(ValidateError.error , 400))
        }

        // check if the images length is less than 10
        if (req.files.length > 10) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("You can only upload a maximum of 10 images" , 403));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in request equal the id in token
        if (req.body.userId != Verify._id) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting author by id in the token 
        const user = await User.findById(Verify._id);
        
        // check if the user in database or not 
        if (!user) {
            DeleteFiles(req.files , next)
            return next(new ApiErrors("The User Not Found ..." , 404))
        }

        if ( Verify._id != user._id) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // create a post
        const post = new Post({
            title : req.body.title,
            created_by : Verify._id,
            images : []
        });

        for (let i = 0; i < req.files.length; i++) {
            // upload the image to cloudinary
            const uploadedFile = await cloudinaryUploading(req.files[i]);

            // add the images url to post's images array
            post.images.push(uploadedFile);
        }

        // delete the images from images folder
        DeleteFiles(req.files , "images" , next);

        // save the post
        await post.save();

        // add the post id to user posts array
        user.posts.push(post._id);

        // save the user after added the post id
        await user.save();

        // create a result
        const result = {
            "message" : "post created successfully",
            "post" : _.pick(post , ['_id' , 'title' , 'images' , 'comments' , 'likes' , 'like_type' , 'saved' , 'created_by'])
        }

        // send the response
        res.status(200).send(result)

    } catch (error) {
        DeleteFiles(req.files , next);
        return next(new ApiErrors(error , 500))
    }

});

module.exports = router;