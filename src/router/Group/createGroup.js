const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Group = require("../../models/group/createGroup");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.post("/" , async (req , res , next) => {

    try {

        // create aSchema to validate body data 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            title : Joi.string().min(3).max(100).required(),
        });

        // validate data using Schema
        const ValidateError = Schema.validate(req.body);

        // if the body data has a problem return error with : ( message : ValidateError.error , status : 400 )
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400))
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the body userId equal id in token
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user  by his id 
        const user = await User.findById(req.body.userId);

        if (!user) {
            return next(new ApiErrors("User Not Found ..." , 404));
        }

        // create a new group
        const newGroup = new Group({
            title : req.body.title,
            created_by : user._id,
        });

        // save the new group in data base
        await newGroup.save();

        // ad the new Group to user saved array
        user.saved.push(newGroup)

        // save user after add the new
        await user.save();

        // create a result 
        const result = {
            "message" : `${newGroup.title} created successfully`,
            "group" : newGroup
        }

        // send the response to user
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;
