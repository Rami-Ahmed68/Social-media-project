const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const Post = require("../../models/post/post");
const Like = require("../../models/like/likes");
const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/" , async ( req , res , next ) => {

    try {

        // create a Schema 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            postId : Joi.string().required()
        });

        // Validate body data using Schema
        const ValidateError = Schema.validate(req.query);

        // check if the body data has any problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body is equal the id in token or not
        if (req.query.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the user by id 
        const user = await User.findById(req.query.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }


        // getting the post by id
        const post = await Post.findById(req.query.postId);

        // check if the post exists or not
        if (!post) {
            return next(new ApiErrors("Invalid Post Not Found ..." , 404));
        }

        // getting the post likes
        const postLikes = await Like.find({ post_id : req.query.postId }).populate({
            path : "user_id",
            select : "_id name avatar"
        });

        // create the result to send it in response
        const result = {
            "message" :  postLikes.length > 0 ?  `this post has a ${postLikes.length} like` : "this post hasn't any likes",
            "doc_length" : postLikes.length,
            "likes" : postLikes.map(like => _.pick(like , ['_id' , 'liked_at' , 'reaction_type'  , 'post_id' , 'user_id']))
        }

        // send response 
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});

module.exports = router;
