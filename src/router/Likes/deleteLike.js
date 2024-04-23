const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const ApiErrors = require("../../utils/apiErrors");
const Like = require("../../models/like/likes");
const Post = require("../../models/post/post");
const Nofitications = require("../../models/nofitication/notifications");
const User = require('../../models/user/register');
const VerifyTokenData = require("../../utils/verifyTokenData");


router.delete("/" , async ( req , res , next ) => {

    try {

        // create a Schema to validate body data 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            likeId : Joi.string().required()
        });

        // Validate body data
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body is equal id in token or not
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user is exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }


        // getting the like object by his id
        const like = await Like.findById(req.body.likeId);

        // check if the like exsist return error with ( message : You did not like this post , status : 404 )
        if (!like) {
            return next(new ApiErrors("Invalid Like Not Found ..." , 404));
        }

        // check if user id not equal like user_id
        if (like.liked_by != Verify._id) {
            return next(new ApiErrors("Unauthorized to delete this like ..." , 403));
        }

        // delete like
        await Like.findByIdAndDelete(req.body.likeId);

        // getting post by his id
        const post = await Post.findById(like.post_id);

        // check if the post not found return error with ( message : Invalide post Id is required , status : 404 )
        if (!post) {
            return next(new ApiErrors("Invalide post Id is required ..." , 404));
        }

        // delete like id from post's likes array 
        post.likes = post.likes.filter(id => {
            return id != req.body.likeId
        });

        // save post changes
        await post.save();

        // getting nofitication
        const notification = await Nofitications.find({ notification_id : like._id });

        // getting the notification author
        const notificationTarget = await User.findById(notification[0].notification_target);

        // delete nofitication id from user nofitications array
        notificationTarget.nofitications = notificationTarget.nofitications.filter(id => id != notification[0].id );

        // save the notification target
        await notificationTarget.save();

         // delete nofitication
        if (notification.length > 0) {
            await Nofitications.findByIdAndDelete(notification[0]._id);
        }

        // create result
        const result = {
            "message" : "Like deleted successfully",
            "like" : like
        }

        // send response with status code 200
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500))
    }
    
});

module.exports = router;
