const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const Group = require("../../models/group/createGroup");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.put("/", async(req , res , next) => {

    try {

        // create a Schema 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            postId : Joi.string().required(),
            groupId : Joi.string().required()
        });

        // validate body data using Schema
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

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the post by his id
        const post = await Post.findById(req.body.postId);

        // check if the post exists
        if (!post) {
            return next(new ApiErrors("Invalid Post Not Found ..." , 404));
        }

        // getting the group by his id
        const group = await Group.findById(req.body.groupId);

        // check if the group exists
        if (!group) {
            return next(new ApiErrors("Invalid Group Not Found ..." , 404));
        }

        // check if the user his owner of the group
        if (!user.saved.includes(req.body.groupId) || group.created_by != user.id) {
            return next(new ApiErrors("You are not the owner of the group" , 403));
        }

        // delete post id from group
        if (!group.saved.includes(post.id)) {
            return next(new ApiErrors("This post is not saved in the group" , 403));
        } else {
            group.saved = group.saved.filter(id => id != post.id);
            console.log(user._id)
            console.log(post.saved)
            post.saved = post.saved.filter(id => id != user.id);
            console.log(post.saved)
        }

        // save the group after deleted the post id
        await group.save();

        // save the posts after deleted the user id from post's saved array
        await post.save();

        // create a result 
        const result = {
            "message" : `Post removed successfully from ${group.title}`,
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