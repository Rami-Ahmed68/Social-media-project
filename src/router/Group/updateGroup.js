const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Group = require("../../models/group/createGroup");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.put("/" , async (req , res , next) => {

    try {
        
        // create a Schema to validate body data
        const Schema = Joi.object().keys({
            title : Joi.string().required(),
            userId : Joi.string().required(),
            groupId : Joi.string().required()
        });

        // validate body data useing Schema
        const ValidateError = Schema.validate(req.body);

        // check if the body data has a problem 
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 500));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id equal token id
        if (req.body.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 401));
        }

        // getting the user by id 
        const user = await User.findById(req.body.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // getting the Group
        const group = await Group.findByIdAndUpdate(req.body.groupId , {
            $set : {
                title : req.body.title ? req.body.title : group.title
            }
        } , { new : true })

        if (!group) {
            return next(new ApiErrors("Invalid Group Not Found ..." , 404));
        }

        // create a result
        const result = {
            "message" : "Group Updated Successfully",
            "group" : group
        }

        // send the response
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
});

module.exports = router;