const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const Reply = require("../../models/comment/replyComment");
const User = require("../../models/user/register");
const Comment = require("../../models/comment/comment");
const Notification = require("../../models/nofitication/notifications");
const ApiErrors = require("../../utils/apiErrors");
const cloudinaryRemove = require("../../utils/deleteCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.delete("/" , async (req , res , next) => {

    try {

        // create a Schema to validate body data 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            replyId : Joi.string().required(),
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 403));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body is equal id in token
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Inavlid User Data..." , 403));
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        if (!user) {
            return next(new ApiErrors("Inavlid User Not Found ..." , 404));
        }

        // find the parent reply
        const parentReply = await Reply.findById(req.body.replyId);

        // check if the reply exists
        if (!parentReply) {
            return next(new ApiErrors("Invalid Reply Not Found ..." , 404));
        }

        // check if the user can delete the reply
        if (parentReply.replyed_by != Verify._id) {
            return next(new ApiErrors("Unauthorized to delete this comment" , 403));
        }

        // check if the parentReply's replys length is gigger than 0 delete it and his images
        if (parentReply.replies.length > 0) {

            parentReply.replies.forEach(async rep => {
                // eaxtract the sub reply
                let subReply = await Reply.findById(rep);

            // delete the subReply's images
            subReply.images.forEach( async image => {
                // delete the images from cloudinary
                await cloudinaryRemove(image);
            });

                // delete the subReply 
                await Reply.deleteOne(rep);
            });

            // delete the parent reply
            await Reply.deleteOne(parentReply._id);

        } else {
            // check if the parent Reply images array length is gigger than 0 delete it and his images
            if (parentReply.images.length > 0) {
                // delete the parent reply images
                parentReply.images.forEach(async image => {
                    await cloudinaryRemove(image);
                })
            };

            // delete the parent reply
            await Reply.deleteOne(parentReply._id);
        }

        // const reply = await Reply.findByIdAndDelete(req.body.replyId);
        const replys = await Reply.find({ parent_reply : req.body.replyId });

        // delete all childs replies and images 
        replys.forEach(async rep => {
            // check if the reply's images length is bigger than 0 delete it and his images
            if (rep.images.length > 0) {
                rep.images.forEach( async image => {
                    cloudinaryRemove(image);
                });
            };

            // delete the reply
            await Reply.deleteOne(rep._id);
        });

        // delete the parent reply from his parent reply replies array 
        const supperParentReply = await Reply.findById( parentReply.parent_reply );

        // filter id's 
        if (supperParentReply && supperParentReply.replies.length > 0) {
            supperParentReply.replies = supperParentReply.replies.filter(id => id != parentReply.id);

            // save the supperParentReply after deleted the id
            await supperParentReply.save();
        }

        // delete the reply notification
        const deletedNotification = await Notification.deleteOne({ notification_id : req.body.replyId });

        // get the parent comment 
        const parentComment = await Comment.findById(parentReply.parent_comment);

        // check if the parent comment exists
        if (!parentComment) {
            return next(new ApiErrors("Invalid Comment Not Found ..." , 404));
        }

        // delete reply id from parent comment replies
        parentComment.replies = parentComment.replies.filter(rep => rep != parentReply.id);

        // save the parent Comment after deleted the parent Reply id
        await parentComment.save();

        // create a result to send it in response
        const result = {
            "message" : "Reply deleted successfully",
            "reply" : _.pick(parentReply , ['_id' , 'body' , 'images' , 'parent_comment' , 'parent_reply' ,'post_id' , 'replyed_by' , 'reply_to' , 'replies'])
        }

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;