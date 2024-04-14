const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../confige.env" });

const User = require("../../models/user/register");
const Request = require("../../models/friendsRequest/friendsRequest");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.put("/", async (req, res, next) => {
    try {
        // create a Schema
        const Schema = Joi.object().keys({
        userId: Joi.string().required(),
        requestId: Joi.string().required(),
        });

        // validate body data
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem
        if (ValidateError.error) {
        return next(new ApiErrors(ValidateError.error, 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user sender id is equal the id in Verify
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ...", 401));
        }

        // getting the user
        const user = await User.findById(req.body.userId);

        // check if the user sender exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ...", 404));
        }

        // getting the request by his id
        const request = await Request.findById(req.body.requestId);

        // check if the request exists
        if (!request) {
            return next(new ApiErrors("Invalid Request Not Found ... " , 404));
        }

        // check if the user id is equal request target or not ( if the user can reject the request or not )
        if (request.future != req.body.userId) {
            return next(new ApiErrors("You are not authorized to refuse the request" , 403))
        }

        // gettin the request sender
        const userSender = await User.findById(request.sender);

        // check if the user sender request is exists or not
        if (!userSender) {
            return next(new ApiErrors("Invalid Request Sender Not Found ..." , 404));
        }
        console.log(request)
        console.log(user)
        // delete the request id from user friends requests array
        user.friendship_requests = user.friendship_requests.filter(id => id != request.id);

        // save the user after deleted the request id from user's friendship_requests
        await user.save();

        // delete the request 
        await Request.deleteOne(req.body.requesrId);

        // create a result
        const result = {
            message: "The friend request was successfully rejected",
            riend: _.pick(userSender, ["_id", "avatar", "name"]),
        };

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error, 500));
    }
});

module.exports = router;
