const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const ApiErrors = require("../../utils/apiErrors");
const Comment = require("../../models/comment/comment");
const Reply = require("../../models/comment/replyComment");
const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const upload = require("../../middleware/uploadeComment");
const CreateNotification = require("../../utils/createNofitications");
const DeleteFiles = require("../../utils/deleteFiles");
const cloudinaryUploading = require("../../utils/uploadCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.post("/" , upload , async (req , res , next) => {

    try {

        // create a reply comment Schema
        const Schema = Joi.object().keys({
            body : Joi.string().min(3).max(300),
            images : Joi.array().items(Joi.any()),
            commentId : Joi.string().required(),
            userId : Joi.string().required(),
            postId : Joi.string().required()
        });

        // validate body data witha Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem return error with : ( message : ValidateError.error , status : 403 )
        if (ValidateError.error) {
            DeleteFiles(req.files);
            return next(new ApiErrors(ValidateError.error , 403))
        }

        // check if the request images length bigger than 5 return error
        if (req.files.length > 5) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("You Can Only Upload 5 Images In Reply ..." , 403));
        }

        // check if the reply has any data or not
        if (!req.body.body && req.files.length == 0) {
            return next(new ApiErrors("Body or images id required ..." , 403))
        }

        // extract the data from token 
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        if (Verify._id != req.body.userId) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data" , 403));
        }

        // check if the user exists
        const user = await User.findById( Verify._id );

        // if the user not found return error with ( message : User Not Found , status : 404 )
        if (!user) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("User Not Found ..." , 404));
        }

        // catch the post by his id 
        const post = await Post.findById(req.body.postId);

        if (!post) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Post Not Found ..." , 404));
        }

        // getting the comment by his id
        const comment = await Comment.findById(req.body.commentId);

        // check if the comment exists
        if (!comment) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("comment not found" , 404));
        }

        // create reply 
        const reply = new Reply({
            body: req.body.body || "",
            replyed_by: req.body.userId,
            reply_to : comment.created_by,
            parent_comment : req.body.commentId,
            parent_reply : req.body.commentId,
            post_id: req.body.postId
        });

        // add images's urls to reply's array
        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                // upload the image to cloudinary
                const uploadedFile = await cloudinaryUploading(req.files[i]);

                // add the images url to post's images array
                reply.images.push(uploadedFile)
            };

            // delete all images from images folder
            DeleteFiles(req.files , next);
        }

        reply.parent_reply = reply._id;

        // save the comment 
        await reply.save();

        // add reply id to comment replies
        comment.replies.unshift(reply._id);

        // save comment 
        await comment.save();

        // getting the comment author 
        const commentAuthor = await User.findById(comment.created_by);

        // create a notification
        const notificationId = await CreateNotification(user.name , "replie" , reply._id , comment.created_by , user.id == commentAuthor.id ? false : true);

        // add the new notification id to comment author notificatios array
        if (notificationId) {
            commentAuthor.nofitications.unshift(notificationId)
        }

        // save the author
        await commentAuthor.save();

        // create result to send it in response
        const result = {
            "message" : "The comment has been replyed",
            "commentInfo" : _.pick(reply , ['_id' , 'body' , 'images' , 'parent_comment' , 'parent_reply' ,'post_id' , 'replyed_by' , 'reply_to' , 'replies'])
        }

        // send the response
        res.status(200).send(result)

    } catch (error) {
        DeleteFiles(req.files , next)
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;