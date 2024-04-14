const express = require("express");
const router = express.Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Request = require("../../models/friendsRequest/friendsRequest");
const ApiErrors= require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.post("/" , async(req , res , next) => {

    try {

        // create a Schema 
        const Schema = Joi.object().keys({
            sender : Joi.string().required(),
            future : Joi.string().required(),
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem return error with : ( message : ValidateError.error , status : 400 )
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the request author equal Verify._id
        if (req.body.sender != Verify._id) {
            return next(new ApiErrors("Invalid Request Author Data ..." , 401));
        }

        // check if the request sender id is not equal future id in body 
        if (req.body.sender == req.body.future) {
            return next(new ApiErrors("You cannot send a friend request to yourself ..." , 403))
        }

        // getting the request author
        const author = await User.findById(req.body.sender);

        // check if the author exists
        if (!author) {
            return next(new ApiErrors("invalid Request Author Not Found ..." , 404));
        }

        // getting the request future
        const futureUser = await User.findById(req.body.future);

        // check if the request future exists
        if (!futureUser) {
            return next(new ApiErrors("Invalid Request Future Not Found ..." , 404));
        }

        // gettin all author requestes
        const requests = await Request.find({
            $and : [
                { sender : req.body.sender },
                { future : req.body.future }
            ]
        });

        // check if the user already sende request
        if (requests.length > 0) {
            return next(new ApiErrors("You cannot send more than one friend request" , 403));
        }

        // gett the target requests
        const targetRequest = await Request.find({
            $and : [
                { sender : req.body.future },
                { future : req.body.sender }
            ]
        });

        // check if the target sended the request to this user
        if (targetRequest.length > 0) {
            return next(new ApiErrors("You already have a friend request from this user" , 403));
        }

        // create a new Request 
        const newRequest = new Request({
            sender : req.body.sender,
            future : req.body.future
        });

        // save the request after created 
        await newRequest.save();

        // add request id to future friendship_requests array
        futureUser.friendship_requests.unshift(newRequest._id)

        // save the future User After added the new request id to his friendship_requests array
        await futureUser.save();

        // create a result 
        const result = {
            "message" : `Friend request has been sent to ${futureUser.name}`,
            "request" : _.pick(newRequest , ['_id' , 'sender' , 'future'])
        };

        // send the response
        res.status(200).send(result)

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});

module.exports = router;