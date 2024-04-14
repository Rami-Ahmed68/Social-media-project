const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Group = require("../../models/group/createGroup");
const Post = require("../../models/post/post");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.put("/" , async (req , res , next) => {

    try {

        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            groupId : Joi.string().required(),
            postId : Joi.string().required()
        });

        // validate body data usin Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem 
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);
        
        // check if the user id equal token id
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user 
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the group
        const group = await Group.findById(req.body.groupId);

        // check if the group exists
        if (!group) {
            return next(new ApiErrors("Invalid Group Not Found ..." , 404));
        }

        // check if the user his owner of the group
        if (group.created_by != user.id || !user.saved.includes(group._id)) {
            return next(new ApiErrors("You are not the owner of the group" , 403));
        }

        // getting the post 
        const post = await Post.findById(req.body.postId);

        // check if the post exists
        if (!post) {
            return next(new ApiErrors("Invalid Post Not Found ..." , 404));
        }

        if (!group.saved.includes(post._id)) {
            group.saved.unshift(post._id);
            // add user id to post's saved array
            post.saved.unshift(user._id);
        } else {
            return next(new ApiErrors("This post has been preserved in advance" , 403));
        }

        //save the group after add the post id
        await group.save();

        // save the post
        await post.save()

        // create a result 
        const result = {
            "message" : `post added successfully to ${group.title}`,
            "post" : post,
            "group" : group
        }

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;