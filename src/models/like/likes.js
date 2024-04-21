const mongoose = require("mongoose");

const like = new mongoose.Schema({
    liked_at : {
        type : Date,
        default : new Date()
    },
    liked_by : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    },
    post_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "post",
        required : true,
    },
    reaction_type : {
        type : String,
        enum : ["Haha" , "Love" , "Care" , "Wow" , "Sad" , "Angry"],
        requierd : true
    }
});


const Like = mongoose.model("like" , like);

module.exports = Like;
