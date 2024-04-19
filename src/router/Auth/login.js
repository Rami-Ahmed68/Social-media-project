const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require('lodash');
const bcrypt = require("bcrypt");



const User = require("../../models/user/register");
const ApiErrors = require("../../utils/apiErrors");
const GenerateToken = require("../../middleware/generateToken");

router.get("/rami" , (req,res) => {
    res.send("RAMI");
})

router.post("/" , async (req , res , next) => {

    try {
        // create user schema to validate 
        const Schema = Joi.object().keys({
            email : Joi.string().min(10).max(30).required().email(),
            password : Joi.string().min(8).max(100).required()
        });

        // validate user data using Schema 
        const ValidateError = Schema.validate(req.body);

        // check if user data has error
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 404))
        }

        // find user in database by email
        const user = await User.findOne({email : req.body.email});

        // if this not found return error with ( status code 404 & message This User Is Not Found )
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // comparison betwen request password and the user password
        const Password = await bcrypt.compare( req.body.password , user.password );

        // if request password not true return error
        if (!Password) {
            return next(ApiErrors("Invalid Email Or Password ..." , 404));
        }

        // generate token to send it in response
        const token = GenerateToken(user._id , user.email);

        // create result to send it in response
        const result = {
            "user_info" : _.pick(user , ['_id' , 'avatar' , 'name' , 'age' , 'email' , 'joined_at']),
            "token" : token
        };

        // send the response to user
        res.status(200).send(result);

    } catch (error) {
        return next(new ApiErrors(error , 500));
    }
})

module.exports = router;
