const mongoose = require("mongoose");


const post = new mongoose.Schema({
    title : {
        type : String,
        min : 3,
        max : 300,
        required : true
    },
    created_by : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    images : [{
            type : String
        }],
    comments : [{
        type : mongoose.Schema.Types.ObjectId,
        defulat : ""
    }],
    created_at : {
        type : Date,
        defualt : new Date()
    },
    likes : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : "like",
            defualt : []
        }],
    like_type : {
        type : String,
        default : ""
    },
    isSaved : {
        type : Boolean,
        defualt : false
    },
    saved : [{
            type : mongoose.Schema.Types.ObjectId,
            ref : "user",
            defualt : []
        }]
})

const Post = mongoose.model("post" , post);

module.exports = Post;