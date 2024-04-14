const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Request = require("../../models/friendsRequest/friendsRequest");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/" , async (req , res , next) => {

    try {

        // create a Schema 
        const Schema = Joi.object().keys({
            userId : Joi.string().required()
        });

        // validate body data with Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id equal Verify id
        if (req.body.userId != Verify._id) {
                return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting all user Requests by his id
        const Requests = await Request.find({ future : req.body.userId }).populate({
            path : "sender",
            select : "_id name avatar"
        });

        // create a result
        const result = {
            "requests_length" : Requests.length,
            "Requests" : Requests
        };

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});

module.exports = router;