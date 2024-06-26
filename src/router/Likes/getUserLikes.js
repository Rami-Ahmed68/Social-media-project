const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });


const User = require("../../models/user/register");
const Like = require("../../models/like/likes");
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

        // validate body data usin the Schema 
        const ValidateError = Schema.validate(req.query);

        // check if the body data has any problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body is equal the id in token or not
        if (req.query.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 404));
        }

        // getting the user by his id
        const user = await User.findById(req.query.userId);

        // check if the user exists or not 
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // home page
        const page = req.query.page || 1;

        // limit of documents 
        const limit = req.query.limit || 5;

        // skip of documents
        const skip = ( page - 1 ) * limit;

        // getting the user's likes
        const likes = await Like.find({ liked_by : req.query.userId })
        .skip(skip)
        .limit(limit)
        .populate(
            {
                path: "post_id",
                select: "_id title images created_by",
                populate : {
                    path : "created_by",
                    select : "_id name avatar"
                }
            }
        );

        // create a result
        const result = {
            "message" : "Your likes have been retrieved successfully",
            "likes" : likes
        }

        // send the response to user
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});


module.exports = router;
