const express = require("express");
const router = express.Router();
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Like = require("../../models/like/likes");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.put("/" , async (req , res , next) => {

    try {

        // create a user Schema to validate user data
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            likeId : Joi.string().required(),
            reactionType : Joi.string().required()
        });

        // validate user body data
        const ValidateErrors = Schema.validate(req.body);

        // check if the user body data has a problem 
        if (ValidateErrors.error) {
            return next(new ApiErrors(ValidateErrors.error , 500));
        }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        if (Verify._id != req.body.userId) {
            return next(new ApiErrors("Invalid User Data ..." , 403))
        }

        // getting the user by his id
        const user = await User.findById(Verify._id);

        // check if the user already exists
        if (!user) {
            return next(new ApiErrors("Invalid User UnAuthenticated" , 404));
        }

        // getting the like by id
        const like = await Like.findByIdAndUpdate(req.body.likeId , {
            $set : {
                reaction_type : req.body.reaction_type
            }
        } , { new : true });

        // check if the like not found
        if (!like) {
            return next(new ApiErrors("Invalid Like Not Found ..." , 404));
        }

        // send the response 
        res.status(200).send(like);


    } catch (error) {
        return next(new ApiErrors(error , 500));
    }

});

module.exports = router;

