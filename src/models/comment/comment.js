const mongoose = require("mongoose");


const comment = new mongoose.Schema({
    body : {
        type : String,
        min : 3,
        max : 300
    },
    images : [{
        type : String
    }],
    created_by : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "user"
    },
    post_id : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "post"
    },
    created_at : {
        type : Date,
        defualt : new Date()
    },
    replies : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "replie"
    }]
});


const Comment = mongoose.model("comment" , comment);
module.exports = Comment;