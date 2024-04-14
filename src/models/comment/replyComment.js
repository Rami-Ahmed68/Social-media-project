const mongoose = require("mongoose");

const reply = new mongoose.Schema({
    body : {
        type : String
    },
    images : [{
        type : String
    }],
    replyed_by : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    reply_to : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    parent_comment : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "comment"
    },
    parent_reply : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "replie"
    },
    post_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "post"
    },
    replies : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "replie"
    }]
});

const Reply = mongoose.model("replie" , reply);

module.exports = Reply;