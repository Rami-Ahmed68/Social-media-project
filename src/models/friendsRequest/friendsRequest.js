const mongoose = require("mongoose");

const request = new mongoose.Schema({
    sender : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "user"
    },
    future : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "user"
    },
    sending_at : {
        type : Date,
        defualt : new Date()
    }
});

const Request = new mongoose.model("request" , request);
module.exports = Request;