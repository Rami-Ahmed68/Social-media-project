const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const upload = require("../../middleware/uploadeComment");
const ApiErrors = require("../../utils/apiErrors");
const Reply = require("../../models/comment/replyComment");
const User = require("../../models/user/register");
const Post = require("../../models/post/post");

const DeleteFiles = require("../../utils/deleteFiles");
const CreateNotification = require("../../utils/createNofitications");
const cloudinaryUploading = require("../../utils/uploadCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.post("/" , upload , async(req , res , next) => {

    try {

        // create a reply comment Schema
        const Schema = Joi.object().keys({
            body : Joi.string().min(3).max(300),
            images : Joi.array().items(Joi.any()),
            replyId : Joi.string().required(),
            userId : Joi.string().required(),
            postId : Joi.string().required()
        });

        // validate body data witha Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem return error with : ( message : ValidateError.error , status : 403 )
        if (ValidateError.error) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors(ValidateError.error , 403))
        }

        //check if the request has any data or no
        if (!req.body.body && req.files.length == 0) {
            return next(new ApiErrors("Reply cannot be edited without any data" , 403));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in request equal the id in token
        if (Verify._id != req.body.userId) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the user by his id
        const user = await User.findById( Verify._id );

        // check if the user exists
        if (!user) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the post by his id
        const post = await Post.findById(req.body.postId);

        if (!post) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid Post Not Found ..." , 404));
        }

        // getting the reply by his id
        const parentreply = await Reply.findById(req.body.replyId);

        if (!parentreply) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid Parent Reply Not Found ..." , 404));
        }

        // create child reply 
        const childreply = new Reply({
            body: req.body.body || "",
            reply_to : parentreply.replyed_by,
            replyed_by: req.body.userId,
            parent_comment : parentreply.parent_comment,
            parent_reply: parentreply.parent_reply,
            post_id: req.body.postId
        });

        // check if the request has a files add them to chlid reply
        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                // upload the image to cloudinary
                const uploadedFile = await cloudinaryUploading(req.files[i]);

                // add the image url to childreply's images array
                childreply.images.push(uploadedFile);
            }

            // delete the images from images folder
            DeleteFiles(req.files , next);
        }

        // add child reply id to Parent reply replies array 
        parentreply.replies.unshift(childreply._id);

        // save the chold reply
        await childreply.save();

        // save the parent reply 
        await parentreply.save();

        // create Notification 
        const notificationId = await CreateNotification(user.name , "replie" , parentreply.id , parentreply.replyed_by , user.id == parentreply.replyed_by ? false : true);

        // getting the parent reply author 
        const parentAuthor = await User.findById(parentreply.replyed_by);

        // add the new notification id to parent reply author notificatios array
        if (notificationId) {
            parentAuthor.nofitications.unshift(notificationId);
        }

        // save the parent reply author after added the new notifications id
        await parentAuthor.save();

        // create result to send it in the response
        const result = {
            "message" : `repled successfully to ${parentreply.reply_to}`,
            "reply" : _.pick(childreply , ['_id' , 'body' , 'images' , 'parent_comment' , 'parent_reply' ,'post_id' , 'replyed_by' , 'reply_to' , 'replies'])
        };

        // send the result in response
        res.status(200).send(result)
    } catch (error) {
        DeleteFiles(req.files , next);
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;