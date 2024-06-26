const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({path : "../../../confige.env"});
const _ = require("lodash");

const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/" , async ( req , res  , next ) => {

    try {

        // create a Schema 
        const Schema = Joi.object().keys({
            userId : Joi.string().required()
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.query);

        // check if the body data has a problecm
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if user id in body is equal the id in token or not
        if (req.query.userId != Verify._id) {
            return next(new ApiErrors("Invalid Authorization header format ..." , 404))
        }

        // getting the user by id
        const user = await User.findById(Verify._id).populate([
            {
                path : "friends",
                select : "_id name avatar"
            },
            {
            path : "posts",
            populate : ([
                {
                  path: "likes",
                  select: "_id liked_by reaction_type",
                },
                {
                  path: "created_by", // Populate the 'author' field
                  select: "_id name avatar", // Select the desired fields from the author's document
                }
              ])
        }
        ]);

        // add like type if the like author id is equal the user id
            user.posts.forEach(post => {
                post.likes.forEach(like => {
                    if (post.likes.length > 0 && like.liked_by == Verify._id) {
                        post.like_type = {reaction_type : like.reaction_type , likeId : like.id}
                    } else {
                        post.like_type = ""
                    }
                 })
            });

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("The User profile Not Found" , 404));
        }

        // create result to send it in response
        const result = {
            "message" : `Welcome back ${user.name}`,
            "user_porfile" : _.pick(user , ['_id' , 'name' , 'avatar' , 'age' , 'joined_at' , 'nofitications' , 'posts' , 'friendship_requests' , "friends"])
        }

        // send response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500))
    }
});

module.exports = router;
