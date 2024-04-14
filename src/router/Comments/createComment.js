const express= require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });


const DeleteFiles = require("../../utils/deleteFiles");
const upload = require("../../middleware/uploadeComment");

const ApiErrors = require("../../utils/apiErrors");
const Comment = require("../../models/comment/comment");
const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const CreateNotification = require("../../utils/createNofitications");
const cloudinaryUploading = require("../../utils/uploadCloudinary");
const VerfiyTokenData = require("../../utils/verifyTokenData");


router.post("/" , upload ,  async ( req , res , next ) => {

    try {

        // create a comment Schema 
        const Schema = Joi.object().keys({
            body : Joi.string().min(3).max(300),
            images : Joi.array().items(Joi.any()),
            userId : Joi.string().required(),
            postId : Joi.string().required()
        });

        // validate body data with 
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem return error with : ( message : ValidateError.error , statsu : 403 )
        if (ValidateError.error) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors(ValidateError.error , 403))
        };

        // check if the images length bigger than 5 return error
        if (req.files.length > 5) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("You Can Upload Only 5 Images In the Comments ..." , 403));
        }

        // check if the body data hasn't a body or images
        if (!req.body.body && req.files.length == 0) {
            return next(new ApiErrors("Body or images is required ..." , 403));
        }

        // extract the data from token
        const Verify = await VerfiyTokenData(req.headers.authorization , next);

        // if the user id in body is equal the id in token or not 
        if (Verify._id != req.body.userId) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data" , 403));
        }

        // check if the user exists
        const user = await User.findById( Verify._id );

        // check if the user not found return error 
        if (!user) {
            // delete all files
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Id" , 404));
        }

        // getting post by his id
        const post = await Post.findById(req.body.postId);

        if (!post) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid Post Id The Post Not Found" , 404));
        }        

        // create a comment
        const comment = new Comment({
            body : req.body.body,
            created_by : req.body.userId,
            post_id : post.id
        });

        // add the comment id to posts comments array
        post.comments.unshift(comment.id);

        // save the post after the added the changes
        await post.save();

        // create nofiticatio if the comment.id != post.created_by
        const notificationId = 
        await CreateNotification
        (user.name , "comment" , comment._id , post.created_by , post.created_by == user.id ? false : true);

        // gettin the post author by his id in post (created_by)
        const author = await User.findById(post.created_by);

        // add nofitication idto user nofitications array
        if (notificationId) {
            author.nofitications.unshift(notificationId);
        }

        await author.save();
        // send the nofitication id to user 

        if (req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                // upload the image to cloudinary
                const uploadedFile = await cloudinaryUploading(req.files[i]);

                // add the images url to post's images array
                comment.images.push(uploadedFile)
            }

            // delete all comment's images from images folder
            DeleteFiles(req.files , next);
        }

        // save comment 
        await comment.save();

        // create result to send it in response
        const result = {
            "message" : "Comment completed successfully",
            "comment" : _.pick(comment , ['_id' , 'body' , 'images' , 'created_by' , 'post_id'])
        };

        res.status(200).send(result);
    } catch (error) {
        DeleteFiles(req.files , next);
        return next(new ApiErrors(error , 500))
    }
});

module.exports = router;