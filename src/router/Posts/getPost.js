const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const Post = require("../../models/post/post");
const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.get("/" , async (req , res , next) => {

    try {
        // create a Schema
        const Schema = Joi.object().keys({
            postId : Joi.string().required(),
            userId : Joi.string().required()
        });

        // validate body data
        const ValidateError = Schema.validate(req.query);

        // check if the body data hasa problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user data equal id in token
        if (req.query.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user by id
        const user = await User.findById(req.query.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the post by id
        const post = await Post.findById( req.query.postId ).populate({
            path : "likes",
            select : "_id user_id reaction_type"
        });

        // if the post not found return error
        if (!post) {
            return next(new ApiErrors("Invalid Post Not Found ...") , 404);
        }

        // check if the user liked the post
        post.likes.forEach(like => {
            if (like.user_id == user.id) {
                post.like_type = like.reaction_type
            }
        });

        // check if the user saved the post
        post.saved.forEach(save => {
            if (save == user.id) {
                post.isSaved = true
            }
        });

        // create a result
        const result = {
            "message" : "Post found successfully",
            "post" : post
        }

        // send the response to user 
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500))
    }

});

module.exports = router;