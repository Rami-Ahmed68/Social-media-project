const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const user = mongoose.Schema({
    name : {
        type : String,
        required : true,
        min : 3,
        max : 50
    },
    age : {
        type : Date,
        min: new Date('1974-01-01'), 
        max: new Date('2004-01-01'),
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true,
        min : 10,
        max : 30
    },
    password : {
        type : String,
        max : 100,
        min : 8,
        required : true
    },
    avatar : {
        type : String,
        defualt : "",
        required : false
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        required : false
    }],
    friends : [{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "user"
    }],
    friendship_requests : [{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "request"
    }],
    saved : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "group"
    }],
    nofitications : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "nofitication"
    }],
    joined_at : {
        type : Date,
        default : new Date()
    },
    friendStatus : {
        type : String,
        defualt : "not-friends"
    }
});

const User = mongoose.model("user" , user);

module.exports = User;