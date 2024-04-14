const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Group = require("../../models/group/createGroup");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.delete("/" , async (req , res , next) => {

    try {

        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            groupId : Joi.string().required()
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body dta has a problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id equal the token id
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401))
        }

        // getting the user by his id 
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the group
        const oldGroup = await Group.findById(req.body.groupId);

        // check if the old group exists
        if (!oldGroup) {
            return next(new ApiErrors("Invalid Group Not Found ..." , 404));
        }

        if (oldGroup.created_by != req.body.userId) {
            return next(new ApiErrors("You are not allowed to delete" , 403))
        }

        // delete old group 
        await Group.deleteOne({ "_id" : oldGroup._id });

        // delete old group id from user saved array
        user.saved = user.saved.filter(group => group != oldGroup.id);

        // save the user after deleted old group id from user saved array
        await user.save()

        // create a result 
        const result = {
            "message" : "Group deleted successfully",
            "group" : oldGroup
        }

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;
