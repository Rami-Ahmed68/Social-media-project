const express = require("express");
const router = express.Router();
const _ = require("lodash");
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Nofitications = require("../../models/nofitication/notifications");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/" , async ( req , res , next ) => {

    try {

        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            userId : Joi.string().required()
        });

        // validate body data 
        const ValidateError = Schema.validate(req.query);

        // check if the body data has a problem return error with : ( message : ValidateError.error , status : 500 )
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 500))
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        if (req.query.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404))
        }

        // getting user by his id
        const user = await User.findById(req.query.userId);

        // check ig the user exists else return error with ( message : The user Not Found , status : 404 )
        if (!user) { 
            return next(new ApiErrors("The User Not Found" , 404));
        }

        // getting user nofitications by his id
        const userNofitications = await Nofitications.find({ notification_target: Verify._id }).populate({
            path : 'notification_id',
            populate : {
                path : "user_id",
                select : "_id name avatar"
            }
        });

        // create a result to send it in response
        const result = {
            "message" : userNofitications.length > 0 ? `${userNofitications.length} New notifications`: `There are no new notifications`,
            "nofitications" : userNofitications.map(ele => _.pick(ele , ['_id' , 'watched' , 'created_at' , 'message' , 'notification_type' , 'notification_target' , 'notification_id']))
        };

        // sedn the response
        res.status(200).send(result);
    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;