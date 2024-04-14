const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });


const User = require("../../models/user/register");
const Notification = require("../../models/nofitication/notifications");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.put("/" , async ( req , res , next ) => {

    try { 

        // create a Schema
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            notificationId : Joi.string().required()
        });

        // validate body data using Schem
        const ValidateError = Schema.validate(req.body);

        // check if the body data has any problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 400))
        };

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id i body is equal the id in token or not
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user is exists or not
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the notification by id 
        const notification = await Notification.findById(req.body.notificationId);

        // check if the notification is exists or not
        if (!notification) {
            return next(new ApiErrors("Invalid Notification Not Found ..." , 404));
        }

        // check if the notification target is equal user id or not 
        if (notification.notification_target != req.body.userId) {
            return next(new ApiErrors("You are not authorized to edite"));
        }

        // update the watched flag to true
        notification.watched = true;

        // save the notification 
        await notification.save();

        // delete the notification id from user's notification array
        user.nofitications = user.nofitications.filter(id => id != notification.id);

        // save the user after deleted the notification id from user's notifications array
        await user.save();

        // create result
        const result = {
            "message" : "Notification watched",
            "notification" : notification
        };

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});

module.exports = router;