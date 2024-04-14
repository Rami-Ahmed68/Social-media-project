const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });


const User = require("../../models/user/register");
const Comment = require("../../models/comment/comment");
const Reply = require("../../models/comment/replyComment");

const Nofitication = require("../../models/nofitication/notifications");
const ApiErrors = require("../../utils/apiErrors");
const DeleteFiles = require("../../utils/deleteFiles");
const cloudinaryRemove = require("../../utils/deleteCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.delete("/" , async (req , res , next) => {

    try {

        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            commentId : Joi.string().required()
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem return error with : ( message : ValidateError.error , status : 400 )
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 403));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the body user id equal the id in token or not
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 403))
        }

        // getting the comment by id
        const comment = await Comment.findById(req.body.commentId);

        // check if the comment exists
        if (!comment) {
            return next(new ApiErrors("No Comment to delete" , 404));
        }

        // check if the user can delete the comment
        if (comment.created_by != Verify._id) {
            return next(new ApiErrors("Unauthorized to delete this comment" , 403));
        }

        // delete all comment replies
        const commentReplies = await Reply.find({ parent_comment : req.body.commentId });

        // delete the reply images and delete reply
        commentReplies.forEach(async reply => {
            // check if the reply images array length is bigger the 0 delete all images
            if (reply.images.length > 0) {
                reply.images.forEach( async image => {
                    await cloudinaryRemove(image);
                })
            }

            // delete the comment
            await Reply.deleteOne(reply._id);
        });

        // delete the comment
        await Comment.findByIdAndDelete(req.body.commentId);

        // check if the comment images array bigger than 0 delete all his images
        if (comment.images.length > 0) {
            comment.images.forEach( async image => {
                cloudinaryRemove(image);
            })
        }

        // find the nofitication by his id 
        const nofitication = await Nofitication.find({ notification_id : comment._id });

        // find and delete the nofitication 
        if (nofitication && nofitication.length > 0) {
            await Nofitication.findByIdAndDelete( nofitication[0]._id );
        }

        if (nofitication.length > 0) {
            // getting user to delete nofitication id from his nofitications array
            const user = await User.findById( nofitication[0].notification_target );

            // delete nofitication id 
            user.nofitications = user.nofitications.filter(ele => ele != nofitication[0].id );

            // save user aftre deleted nofitication id
            await user.save();
        }

        // create result to send it in response
        const result = {
            "message" : "comment deleted successfully",
            "comment" : comment
        }

        // send the response 
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});

module.exports = router;