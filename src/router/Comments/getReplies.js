const express = require("express");
const router = express.Router();
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Reply = require("../../models/comment/replyComment");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/" , async (req , res , next) => {

    try {

        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            replyId : Joi.string().required(),
            userId : Joi.string().required()
        });

        // validate a body data 
        const ValidateError = Schema.validate(req.body);

        // if the body has a problem return error with : ( message : ValidateError.error , status : 403 )
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 403));
        }

        // extract the data from token 
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id equal the id in token
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the reply replies
        const reply = await Reply.findById(req.body.replyId)
            .populate({
                path: 'replies',
                populate: {
                path: 'replyed_by',
                select: '_id name avatar'
                }
            });

            // create a result
            const result = {
                "message" : "Data fetched successfully",
                "doc_length" : reply.replies.length,
                "replies" : reply
            }

        // send the replies in response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;