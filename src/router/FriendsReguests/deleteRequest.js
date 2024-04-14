const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path: "../../../confige.env" });

const User = require("../../models/user/register");
const Request = require("../../models/friendsRequest/friendsRequest");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.delete("/", async (req, res, next) => {
    try {
        // create a Schema
        const Schema = Joi.object().keys({
            sender : Joi.string().required(),
            future : Joi.string().required()
        });

        // validate body data using 
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem return error with : ( message : ValidateError.error , status : 400 )
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the request author equal Verify._id
        if (req.body.sender != Verify._id) {
            return next(new ApiErrors("Invalid request Author Data ..." , 401));
        }

        // getting the request author 
        const author = await User.findById(req.body.sender);

        // check if the request author exists
        if (!author) {
            return next(new ApiErrors("Invalid Request Author Not Found ..." , 404));
        }

        // getting the request future
        const futureUser = await User.findById(req.body.future);

        // check if the request future exists
        if (!futureUser) {
            return next(new ApiErrors("INvalid Request Future Not Found ..." , 404));
        }

        // getting the request and delete
        const deletedRequest = await Request.findOneAndDelete({
                sender : req.body.sender,
                future : req.body.future
        });

        // check if the request exists
        if (!deletedRequest) {
            return next(new ApiErrors("No Request to delete ..." , 404));
        }

        // delete old request id from future friendship_requests array
        futureUser.friendship_requests = futureUser.friendship_requests.filter(request => request != deletedRequest.id);

        // save the request future
        await futureUser.save();

        // create a result 
        const result = {
            "message" : "Request deleted successfully",
            "request" : deletedRequest
        }

         // send the response
        res.status(200).send(result)

        } catch (error) {
            return next(new ApiErrors(error, 500));
        }
    });

    module.exports = router;
