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

router.delete("/" , async (req , res , next) => {

    try {

        // create a Schema 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            notificationId : Joi.string().required()
        });

        // validate body data using Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has any problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 401));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body is equal theid in token or not
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the user by his id
        const user = await User.findById(req.body.userId);

        // check if the user is exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404))
        }

        // getting the notification by id
        const notification = await Notification.findById(req.body.notificationId);

        // check if the notification is exists
        if (!notification) {
            return next(new ApiErrors("Invalid Notification Not Found ..." , 404));
        }

        // check if the user can delete this notification or not
        if (req.body.userId != notification.notification_target) {
            return next(new ApiErrors("You are not authorized to delete" , 403));
        }

        // delete the notification
        await Notification.deleteOne(notification._id);

        // delete the notification id from user's notificatios array
        user.nofitications = user.nofitications.filter(id => id != notification.id);

        // save the user 
        await user.save();

        // create result 
        const result = {
            "message" : "Notification deleted successfully",
            "notification" : notification
        }

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});

module.exports = router;