const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });


const Comment = require("../../models/comment/comment");
const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.get("/" , async (req , res , next) => {
    
    try {

        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            postId : Joi.string().required(),
            userId : Joi.string().required()
        });

        // validate a body data
        const ValidateError = Schema.validate(req.body);

        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 500));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body is equal the id in token 
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid USer Data ..." , 403))
        }

        // getting the user by his id 
        const user = await User.findById(Verify._id);

        // check if the user alread exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // check if the post exists 
        const post = await Post.findById(req.body.postId);

        if (!post) {
            return next(new ApiErrors("Invalid Post Not Found ..." , 404));
        }

        // home page
        const page = req.query.page || 1;

        // limit of documents
        const limit = req.query.limit || 5;

        // skip of documents
        const skip = (page - 1) * limit;

        // const post = await Post.findById(req.params.id);
        const comments = await Comment.find({ post_id: req.body.postId })
        .skip(skip)
        .limit(limit)
        .populate({
                path: "created_by",
                select: "_id name avatar"
        })
        .populate({
            path: "replies",
            populate: {
                path: "replyed_by",
                select: "_id name avatar"
            }
        });
        
        if (!comments) {
            return next(new ApiErrors("No comments" , 404));
        }

        // create a result to send it in response
        const result = {
            "message" : "Data fetched successfully",
            "doc_length" : comments.length,
            "comments" : comments
        }

        // send the result in response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500))
    }

});

module.exports = router;