const express = require("express");
const router = express.Router();
const _ = require('lodash');
const Joi = require("joi");
const dotenv = require("dotenv");
dotenv.config({ path : "../../../confige.env" });

const User = require("../../models/user/register");
const Request = require("../../models/friendsRequest/friendsRequest");
const ApiErrors = require("../../utils/apiErrors");
const VerifyTokenData = require("../../utils/verifyTokenData");

router.get("/" , async (req , res , next) => {
        try {

            // create a Schema 
            const Schema = Joi.object().keys({
                userId : Joi.string().required(),
                userTargetId : Joi.string().required()
            });

            // validate body data usein Schema
            const ValidateError = Schema.validate(req.query);

            // check if the body data has a problem
            if (ValidateError.error) {
                return next(new ApiErrors(ValidateError.error , 401));
            }

        // extract the data from token
        const Verify = await VerifyTokenData(req.headers.authorization , next);

            // check if the user id equal the id in token
            if (req.query.userId != Verify._id) {
                return next(new ApiErrors("Invalid User Data ..." , 403));
            }

            // getting the user by his id
            const user = await User.findById(req.query.userId);

            // check if the user exists
            if (!user) {
                return next(new ApiErrors("Invalid User Not Found ..." , 404));
            }

            // getting the user target by his id
            const userTarget = await User.findById(req.query.userTargetId).populate([
                {
                    path: "friends",
                    select : "_id name avatar",
                    options: { limit: 10 },
                },
                {
                    path: "posts", 
                    options: { limit: 10 },
                },
            ]);

            // check if the user target is exists
            if (!userTarget) {
                return next(new ApiErrors("Invalid User Target Not Found ..." , 404));
            }

            // check if the user target is friends with user
            if (user.friends.includes(userTarget._id) && userTarget.friends.includes(user._id)) {
                userTarget.friendStatus = "friends"
            }

            // getting the userTarget request
            const userRequestfromTarget = await Request.find({ 
                sender : req.body.userTargetId ,
                future : req.body.userId ,
            });

            // check if the user has any friend request from userTarget
            if (userRequestfromTarget[0]) {
                userTarget.friendStatus = "pending_target"
            }

            // getting the user request 
            const TargetRequestfromUser = await Request.find({ 
                future : req.body.userTargetId ,
                sender : req.body.userId ,
            });

            // check if the user target has any request from user
            if (TargetRequestfromUser[0]) {
                userTarget.friendStatus = "pending_user"
            }

            // create a result
            const result = {
                "message" : "User found successfully",
                "user_info" : _.pick(userTarget , ['_id' , 'avatar' , 'name' , 'age' , 'friendStatus' , 'posts' , 'friends' , 'joined_at'])
            };

            // send the response
            res.status(200).send(result);

        } catch (error) {
            return next(new ApiErrors(error , 500));
        }
});

module.exports = router;