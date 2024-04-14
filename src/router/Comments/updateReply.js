const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const Reply = require("../../models/comment/replyComment");
const Comment = require("../../models/comment/comment");
const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");
const DeleteFiles = require("../../utils/deleteFiles");
const CreateNotification = require("../../utils/createNofitications");
const upload = require("../../middleware/uploadeComment");
const cloudinaryUploading = require("../../utils/uploadCloudinary");
const cloudinaryRemove = require("../../utils/deleteCloudinary");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.put("/" , upload , async (req , res , next) => {

    try {

        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            body : Joi.string().min(3).max(300),
            images : Joi.array().max(5).items(Joi.any()),
            userId : Joi.string().required(),
            replyId : Joi.string().required(),
        });

        // validate the body data with a Schema 
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem
        if (ValidateError.error) {
            DeleteFiles(req.files , next)
            return next(new ApiErrors(ValidateError.error , 400))
        }

        // check if the request any data
        if (!req.body.body && req.files.length == 0) {
            return next(new ApiErrors("Reply cannot be edited without any data" , 403));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the userId is equal id in token
        if (req.body.userId != Verify._id ) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user by his id
        const user = await User.findById( Verify._id );

        // check if the user exists
        if (!user) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the reply to access data
        const oldReply = await Reply.findById( req.body.replyId );

        // check if the oldReply is exists
        if (!oldReply) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Invalid Reply Not Found ..." , 404));
        }

        // update images function
        const Update = async function (oldFiles) {
            let images = [];
            // delete all old reply images
            if (oldFiles.length > 0) {
                oldFiles.forEach(async image => {
                    await cloudinaryRemove(image);
                });
            }

            // upload the new images to cloudinary
            for(let i = 0; i < req.files.length; i++) {
                // upload the image to cloudinary
                const uploadedFile = await cloudinaryUploading(req.files[i]);

                // add the new image to images array
                images.push(uploadedFile);
            }

            // delete the images from images folder 
            DeleteFiles(req.files , next);

            // return the image array to replace it with the reply image array
            return images;
        }

        // emptying reply images array
        const emptying = function (oldImages) {
            oldImages.forEach( async image => {
                await cloudinaryRemove(image);
            });

            // return an empty array to replace it with the comment images array
            return [];
        }

        // getting the reply and update it
        const reply = await Reply.findByIdAndUpdate(req.body.replyId , {
            $set : {
                body : req.body.body ? req.body.body : oldReply.body,
                images : req.files.length > 0 
                ? await Update(oldReply.images) 
                : await emptying(oldReply.images)
            }
        } , { new : true });

        // check if the reply exists
        if (!reply) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("Inavlid Reply Not Found ..." , 403));
        }

        // check if user == reply author
        if (reply.replyed_by != user.id) {
            DeleteFiles(req.files , next);
            return next(new ApiErrors("You are not allowed to edit ..." , 403));
        }

        // geting the parent reply author
        const replyTarget = await User.findById( reply.reply_to );

        // create a Notification
        let notificationId = 
        await CreateNotification
        (user.name , "replie" , reply._id , replyTarget._id , replyTarget.id == user.id ? false : true );

        // add the Notification to user Notifications array
        if (notificationId) {
            replyTarget.nofitications.unshift(notificationId)
        }

        // save author after added the new Notifications id
        await replyTarget.save();

        // save the reply after updated
        await reply.save();
        
        // create a result to send it in response
        const result = {
            "message" : "Reply Updated Successfully",
            "reply" : reply
        }

        // send the response
        res.status(200).send(result)

    } catch (error) {
        DeleteFiles(req.files , next);
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;
