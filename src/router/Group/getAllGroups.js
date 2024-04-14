const express = require("express");
const router = express.Router();
const Joi = require("joi");

const Group = require("../../models/group/createGroup");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/" , async (req , res , next) => {

    try {

        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
        });

        // Validate body data with Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id equal token id
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user 
        const Groups = await Group.find({ created_by : req.body.userId }).populate("saved");

        // create a result
        const result = {
            "groups_length" : Groups.length,
            "groups_data" : Groups
        }
        
        res.status(200).send(result)
    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;