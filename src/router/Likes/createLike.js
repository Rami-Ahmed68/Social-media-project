const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const ApiErrors = require("../../utils/apiErrors");
const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const Like = require("../../models/like/likes");
const CreateNotification = require("../../utils/createNofitications");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.post("/" , async ( req , res , next ) => {

    try {

        // create Schema to validate like data
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            postId : Joi.string().required(),
            reactionType : Joi.string().min(3).max(5).required()
        });

        // validate the body using Joi validatetion
        const validateErrors = Schema.validate(req.body);

        // check if the validate has a problem return error with ( message : validateErrors , status : 400 ) 
        if (validateErrors.error) {
            return next(new ApiErrors(validateErrors.error , 400))
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);
        
        if (Verify._id != req.body.userId) {
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the post by id
        const post = await Post.findById(req.body.postId);

        if (!post) {
            return next(new ApiErrors("The Post Not Found ..." , 404));
        }

        // get old like
        const oldLike = await Like.find({ liked_by : Verify._id })

        // if the user has already liked this post
        if (oldLike.length > 0 && post.likes.includes(oldLike[0].id)) {
            return next(new ApiErrors("You Can't add more than one like" , 409));
        }

        // getting the user by his id
        const user = await User.findById(Verify._id);

        // if the user exists else return error with ( message : This User Not Found ... , status : 404 )
        if (!user) {
            return next(new ApiErrors("This User Not Found ..." , 404));
        }

        // create like data 
        const like = new Like({
            liked_by : req.body.userId,
            post_id : req.body.postId,
            reaction_type : req.body.reactionType
        });

        // add like id to posts likes array 
        post.likes.unshift(like._id)

        // create notification data 
        const notificationId =  await CreateNotification(user.name , "like" , like._id , post.created_by , post.created_by == user.id ? false : true);
        // getting post author by post created_by
        const author = await User.findById(post.created_by);

        if (!author) {
            return next(new ApiErrors("Invalid author id" , 403));
        }

        // add nofitication id to users nofitications array
        if (notificationId) {
            author.nofitications.unshift(notificationId);
        }

        // save like after created and added user aid to posts likes array 
        await like.save();

        // save post afetr add user id
        await post.save();

        // save author after added the nofitication to his nofitications array
        await author.save();

        // create result to send it in response
        const result = {
            "message" : "Liked Successfully",
            'likeInfo' : like
        };

        // send yje response
        res.status(200).send(result);

    } catch (error) {
        // if the server has a problem return it with ( message : error , status : 500 )
        return next(new ApiErrors(error , 500))
    }

});

module.exports = router;
