const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const Comment = require("../../models/comment/comment");

const DeleteFiles = require("../../utils/deleteFiles");
const ApiErrors = require("../../utils/apiErrors");
const upload = require("../../middleware/uploadeComment");
const CreateNotification = require("../../utils/createNofitications");
const cloudinaryUploading = require("../../utils/uploadCloudinary");
const cloudinaryRemove = require("../../utils/deleteCloudinary");
const VerfiyTokenData = require("../../utils/verifyTokenData");


router.put("/" , upload , async(req , res , next) => {

    try {

        // create a validate Schema to vaildate request data
        const Schema = Joi.object().keys({
            body : Joi.string().min(3).max(300),
            images : Joi.array().min(1).max(5).items(Joi.any()),
            userId : Joi.string().required(),
            commentId : Joi.string().required()
        });

        // validate request data
        const ValidateError = Schema.validate(req.body);

        // check if the request data has a problem
        if (ValidateError.error) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // check if the request don't have any image and body
        if (!req.body.body && req.files.length == 0) {
            return next(new ApiErrors("Comment cannot be edited without any data" , 403));
        }

        // check if the images length in request is bigger than 5 return error
        if (req.files.length > 5) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("You Can Upload Only 5 Images In Comment ..." , 403));
        }

        const Verify = await VerfiyTokenData(req.headers.authorization , next);

        if (req.body.userId != Verify._id) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user by id 
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the old comment to access data
        const oldComment = await Comment.findById( req.body.commentId );

        if (user.id != oldComment.created_by ) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("You are not authorized to edit" , 403))
        }

        if (!oldComment) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Inavlid Comment Not Found ..." , 404))
        }

        // update post images
        const Update = async function (oldFiles) {
            let images = [];
            // check if the old images length is bigger than 0
            if (oldFiles.length > 0) {
                oldFiles.forEach(async image => {
                    // delete the image from 
                    await cloudinaryRemove(image);
                });
            }

            // upload the new images to cloudinary 
            for (let i = 0; i < req.files.length; i++) {
                const uploadedFile = await cloudinaryUploading(req.files[i]);

                // add the image url to images array
                images.push(uploadedFile);
            }

            // delete the request images from images folder
            DeleteFiles(req.files , next);

            // return the image array to replace it with the comment image array
            return images;
        }

        // emptying reply images array
        const emptying = function (oldImages) {
            if (oldImages.length > 0) {
                oldImages.forEach(async image => {
                    await cloudinaryRemove(image);
                });
            }

            // return an empty array to replace it with the comment images array
            return [];
        }

        // getting comment by his id
        const comment = await Comment.findByIdAndUpdate(req.body.commentId , {
            $set : {
                body : req.body.body ? req.body.body : '',
                images : req.files.length > 0 
                ? await Update(oldComment.images) 
                : await emptying(oldComment.images)
            }
        } , { new : true });

        // check if the comment exsist
        if (!comment) {
            DeleteFiles(req.files , next)
            return next(new ApiErrors("Invalid comment id" , 404));
        }

        // check if the user can update this comment or no
        if ( comment.created_by != Verify._id ) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Unauthorized to update this comment" , 403));
        }

        // save the post after updated
        await comment.save();

        // getting the post byhis id 
        const post = await Post.findById(comment.post_id);

        // getting the post author by his id 
        const postAuthor = await User.findById(post.created_by);

        // create the new nofitication 
        const notificationId =  
        await CreateNotification
        (user.name , "comment" , comment._id , postAuthor._id , postAuthor.id != user.id ? false : true);

        // add the new nofitication id to the post author nofitications array
        if (notificationId) {
            postAuthor.nofitications.unshift(notificationId);
        }   
        // save the post author after added the new nofitication id
        await postAuthor.save();

        // create result to send it in response
        const result = {
            "message" : "comment Updated successfully",
            "comment" : comment
        }

        // send the result to user
        res.status(200).send(result);

    } catch (error) {
        DeleteFiles(req.files , next);
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;
