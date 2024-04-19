const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Request = require("../../models/friendsRequest/friendsRequest");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/all" , async (req , res , next) => {
    try {

        // create a Schema 
        const Schema = Joi.object().keys({
            userId : Joi.string().required(),
            page : Joi.number(),
            limit : Joi.number()
        });

        // validate body data using the Schema
        const ValidateError = Schema.validate(req.query);

        // check if the body data has a problem
        if (ValidateError.error) {
            return next(new ApiErrors(ValidateError.error , 403));
        };
        
        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

        // check if the user id in body equal the id in token or not
        if (req.query.userId != Verify._id) {
            return next(new ApiErrors("Invalid User Data ..." , 403));
        }

        // getting the user by his id
        const user = await User.findById(req.query.userId);

        // check if the user exists
        if (!user) {
            return next(new ApiErrors("Invalid User Not Found ..." , 404));
        }

        // home page
        const page = req.query.page || 1;

        // limit of documents  
        const limit = req.query.limit || 5;

        // skip of documents
        const skip = (page - 1) * limit;

        // Getting users in database
        let users = await User.find().skip(skip).limit(limit);

        // filtering the users and delete the user friend from users array
        users = users.filter(ele => !ele.friends.includes(user._id) && ele.id != user.id);

        users = await Promise.all(users.map(async (ele) => {

            // getting the user target requests
            let targetRequest = await Request.find({ sender: ele._id, future: req.query.userId });

            // getting the user requests
            let userRequest = await Request.find({ sender: req.query.userId, future: ele._id });

            // check if the user target has a request
            if (targetRequest.length > 0) {
                ele.friendStatus = "pending_target";
                // check if the user has a request
            } else if (userRequest.length > 0) {
                ele.friendStatus = "pending_user";
                // check if the user ele friends array the user id or not
            } else if (!ele.friends.includes(req.query.userId)) {
                ele.friendStatus = "not-friends";
            } 

            return ele;
        }));

        // create result 
        const result = {
            "doc_length" : users.length,
            "users" : users.map( user => _.pick(user , ['_id' , 'name' , 'avatar' , 'age' , 'joined_at' , 'friends' , 'friendStatus']))
        }

        // send the response
        res.status(200).send(result)

    } catch (error) {
        return next(new ApiErrors(error) , 500)
    }
});


module.exports = router;