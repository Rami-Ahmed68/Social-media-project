const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Request = require("../../models/friendsRequest/friendsRequest");
const ApiErrors = require('../../utils/apiErrors');
const CreateNotifications = require("../../utils/createNofitications");
const VerifyTokenData = require("../../utils/verifyTokenData");


router.put("/" , async (req , res , next) => {

    try {

        // create a Schema
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            requestId : Joi.string().required()
        });

        // Validate body data
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the request author equal VerifytokenData._id
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user by id
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the request 
        const request = await Request.findByIdAndDelete(req.body.requestId);

        // check if the request exists
        if (!request) {
            return next(new ApiErrors("Invalid request Not Found ..." , 404));
        }

        // getting the request sender
        const requestSender = await User.findById(request.sender);

        // add the user id to request sender friendship_requests array
        requestSender.friends.unshift(user.id);

        // create a Notificatio
        let notificationId = await CreateNotifications(user.name , "friend" , user._id , requestSender._id , true);

        if (notificationId) {
            requestSender.nofitications.unshift(notificationId)
        }

        // save the request sender 
        await requestSender.save();

        // delete the request id from user friendship_requests array
        user.friendship_requests = user.friendship_requests.filter(reque => reque != request.id);

        // add the request Sender id to user friendship_requests array
        user.friends.unshift(requestSender.id);

        //save the user after delete the request id from friendship_requests array
        await user.save();

        // create a result 
        const result = {
            "message" : `${requestSender.name}'s friend request has been accepted`,
            "user" : _.pick(requestSender , ['_id' , 'avatar' , 'name'])
        }

        // send the response
        res.status(200).send(result);

    }catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;