const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });
const _ = require("lodash");

const ApiErrors = require("../../utils/apiErrors");

const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const Like = require("../../models/like/likes.js");
const Comment = require("../../models/comment/comment");
const Reply = require("../../models/comment/replyComment");
const cloudinaryRemove = require("../../utils/deleteCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.delete("/" , async ( req , res , next ) => {

    try {

        // create a Schem 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            postId : Joi.string().required()
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user by id
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // get post by email from database 
        const post = await Post.findById( req.body.postId );

        if (!post) {
            return next(new ApiErrors("Invalid The Post Not Found ..." , 404));
        }

        if (post.created_by != Verify._id) {
            return next(new ApiErrors("You are not authorized to delete" , 403));
        }

        // delete post id from user posts array
        user.posts = user.posts.filter(id => id != post.id)

        // save the user after deleted the post idfrom posts array
        await user.save();

        // delete all post's likes
        const postLikes = await Like.deleteMany({ post_id: req.body.postId });

        // getting all users
        let users = await User.find();

        // getting all users saved this post
        users.forEach(async user => {
            user.saved = user.saved.filter(id => id != post.id);
            await user.save();
        });

        // delete all post's comments
        const postComments = await Comment.find({ post_id : post._id });

        // delete all comment images
        postComments.forEach(async comment => {
            // await cloudinaryRemove()
            comment.images.forEach(async image => {
                await cloudinaryRemove(image);
            });

            // delete the comment 
            await Comment.deleteOne(comment._id)
        })

        // delete all comment replies
        const postReplies = await Reply.find({ post_id : post._id });

        // delete all reply images
        postReplies.forEach(async reply => {
            // await cloudinaryRemove()
            reply.images.forEach(async image => {
                await cloudinaryRemove(image);
            });

            // delete reply
            await Reply.deleteOne(reply._id)
        });

        // check if the post has any image and delete it
        if (post.images.length > 0) {
            post.images.forEach(async image => {
                await cloudinaryRemove(image);
            })
        }

        // delete post 
        await Post.deleteOne(post._id);

        // create result to send it in response 
        const result = {
            "message" : "Post Deleted Successfully",
            "post" : _.pick(post , ['title' , 'created_by' , 'id' , 'images' , 'likes' , 'saved'])
        }

        // send the response
        res.status(200).send(result)

    } catch (error) {
        return next(new ApiErrors(error , 500))
    }
});


module.exports = router;