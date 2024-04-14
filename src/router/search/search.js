const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Post = require("../../models/post/post");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.get("/" , async (req , res , next) => {

    try {

        // create Schema to validate body data
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            key : Joi.string().required(),
            path : Joi.string()
        });

        // Validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has any problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400))
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body is equal id in token or not
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invaid User Data ..." , 403))
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user exists or not
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        let users;
        let posts;

        // seacr in data base about user

        if (req.body.path == "post") {
            // if the body has a path search in the posts collection
            posts = await Post.find({
                title: {
                    $regex: new RegExp(req.body.key, "i"),
                },
            })
            .sort({ title : 1 })
            .populate({
                path : "created_by",
                select : "_id name avatar"
            });
        } else {
            // else search in the users collection
            users = await User.find({
                name: {
                    $regex: new RegExp(req.body.key, "i"),
                },
            }).sort({
                name : 1
            }).select("_id name avatar");
        }

        // create result 
        const result = {
            "message": users?.length > 0 ? `${users.length} results` : posts?.length > 0 ? `${posts.length} results` : "No results found",
            "data": users?.length > 0 ? users : posts,
        };

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500))
    }
});

module.exports = router;