const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Group = require("../../models/group/createGroup");
const Post = require("../../models/post/post");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/" , async (req , res , next) => {

    try {

        // create a Schema 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            groupId : Joi.string().required()
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem retuen error with : ( message : ValidateError.error , status : 400 ) 
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
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the group by his id 
        const group = await Group.findById(req.body.groupId).populate("saved");

        // check if the group exists
        if (!group) {
            return next(new ApiErrors("Invalid Group Not Found ..." , 404));
        }

        // check if the user his owner of the group
        if (!user.saved.includes(group._id) || group.created_by != user.id) {
            return next(new ApiErrors("You are not the owner of the group" , 403));
        }

        // create a result 
        const result = {
            "group_info" : _.pick(group , ['_id' , 'title' , 'created_at' , 'created_by']),
            "saved_length" : group.saved.length,
            "group_data" : group.saved
        }

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;