const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const Like = require("../../models/like/likes");
const Reply = require("../../models/comment/replyComment");
const Comment = require("../../models/comment/comment");

const DeleteFiles = require("../../utils/deleteFiles");
const ApiErrors = require("../../utils/apiErrors");
const cloudinaryRemove = require("../../utils/deleteCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.delete("/", async (req, res , next) => {

    try {

        // create user schema to validate
        const Schema = Joi.object().keys({
            email: Joi.string().min(10).max(30).required().email(),
            password: Joi.string().min(8).max(100).required(),
        });

        // validate user data using Schema 
        const ValidateError = Schema.validate(req.body);

        // check if user data has error
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 403));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // find user in database by email
        const user = await User.findById(Verify._id);

        // check if the user email equal the email sended in request or not
        if (user.email != req.body.email) {
            return next(new ApiErrors("Invalid User Email ..." , 403));
        }

        // if this user not found return error with ( status code 404 & message this user not found )
        if (!user) { 
            return next(new ApiErrors("Invalid User Not Found ..." , 404))
        }

        // check if the user id is equal the id in token or not
        if (user._id != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // comparison betwen request password and the user password 
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);

        // if request password not true return error
        if (!passwordMatch) {
            return next(ApiErrors("Invalid email or password"))
        }

        // delete user posts
        const userPosts = await Post.find({ created_by : user._id });

        // delete user's posts
        userPosts.forEach(async post => {
            if (post.images.length > 0) {
                post.images.forEach( async image => {
                    await cloudinaryRemove(image);
                });
            }

            // delete the post
            await Post.deleteOne(post._id);

            post.comments.forEach(async comment => {
                // find comment
                let comme = await Comment.findById(comment);

                // check if the comment's images array length is bigger than 0
                if (comme.images.length > 0) {
                    comme.images.forEach( async image => {
                        // delete the comment's images
                        await cloudinaryRemove(image);
                    });
                }

                // delete comment
                await Comment.deleteOne(comment);
            });

            // find all post relies
            const postReplies = await Reply.find({ post_id : post._id });

            postReplies.forEach(async reply => {
                // check if the reply's images length is bigger than 0 delete his images
                if (reply.images.length > 0) {
                    reply.images.forEach( async image => {
                        await cloudinaryRemove(image);
                    });
                }

                // delete reply
                await Reply.deleteOne(reply._id);
            });

            // find all post likes
            post.likes.forEach(async like => {
                // delete the post likes
                await Like.deleteOne(like);
            });
        });

        // delete all user likes
        const userLikes = await Like.deleteMany({ user_id : user._id });

        // delete user
        await User.findByIdAndDelete(user._id);

        // delete user avatar from cloudinary
        await cloudinaryRemove(user.avatar)

        // create result to send it in resonse
        const result = {
            "message" : "User Deleted Successfully.",
            "user_info" : _.pick(user , ['name' , 'avatar' , 'age' , 'email' , 'posts' , 'joined_at']) 
        };

        // send response 
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});

module.exports = router;