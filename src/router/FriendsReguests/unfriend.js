const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.put("/" , async (req , res , next) => {

    try {

        // create aSchem to Validate Boy Data 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            friendId : Joi.string().required()
        });

        // Validate body data using the Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has any problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body isequal the id in Verify or not
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401))
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user exists or not
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the friend by his id
        const friend = await User.findById(req.body.friendId);

        // check if the friend is exists
        if (!friend) {
            return next(new ApiErrors("Invalid Friend Not Found ..." , 404));
        }

        // check if the user and the friend are friends or not
        if (!user.friends.includes(friend._id)) {
            return next(new ApiErrors(`You cannot unfriend ${friend.name} because you are not friends` , 403));
        }

        // delete friend id from user freidns array
        user.friends = user.friends.filter(id => id != friend.id);

        // save the user 
        await user.save();

        // delete user id from friend's friends array
        friend.friends = friend.friends.filter(id => id != user.id);

        // save the friend
        await friend.save();

        // create a result 
        const result = {
            "message" : `The friendship with ${friend.name} has been cancelled successfully`,
            "friend_Info" : _.pick(friend , ['_id' , 'name' , 'avatar'])
        }

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500))
    }
});


module.exports = router;