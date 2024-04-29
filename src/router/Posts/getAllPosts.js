const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env"});

const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.get("/" , async (req , res , next) => {

    try {

        // create a Schema
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            page : Joi.number(),
            limit : Joi.number()
        });

        // Validate body data using Schema
        const ValidateError = Schema.validate(req.query);

        // if the body data has a problem return error with : ( message : ValidateError.error , status : 400 )
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400))
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the body userId equal id in token
        if (req.query.userId != Verify._id) {
            return next(new ApiErrors("Ivalid User Data ..." , 401));
        }

        // gettingthe user by his id
        const user = await User.findById(Verify._id);
        
        // check if the user not found
        if (!user) {
            return next(new ApiErrors("The User UnAuthenticated" , 404));
        }

        // home page 
        const page = req.query.page || 1;

        // limit of documents
        const limit = req.query.limit || 5;

        // skip of documents
        const skip = ( page - 1 ) * limit;

        // Getting posts in database
        const posts = await Post.find().skip(skip).limit(limit).select().populate([
    {
      path: "likes",
      select: "_id liked_by reaction_type",
        {
          path: "liked_by", // Populate the 'author' field
          select: "_id name avatar", // Select the desired fields from the author's document
        }
    }
  ]).sort({created_at : -1});

        // add like type to post whene user want the post
        posts.forEach(post => {
            post.likes.forEach(like => {
                if (post.likes.length > 0 && like.liked_by == Verify._id) {
                    post.like_type = {reaction_type : like.reaction_type , likeId : like.id}
                } else {
                    post.like_type = ""
                }
            })
        })

        // check if the user save the post
        posts.forEach(post => {
            post.saved.forEach(save => {
                if (save == Verify._id) {
                    post.isSaved = true
                }
            })
        })

        // create result 
        const result = {
            "posts_length" : posts.length,
            "posts" : posts.map(post => _.pick(post , ['_id' , 'title' , 'created_at' , 'created_by' , 'images' , 'comments' , 'likes' , 'like_type' , 'saved' , 'isSaved']))
        }

        // send the response to user
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error) , 500)
    }

});


module.exports = router;
