const mongoose = require("mongoose");


const notification = new mongoose.Schema({
    message : {
        type : String,
    },
    notification_type : {
        type : String,
        enum : ["like" , "comment" , "replie" , "user"],
    },
    notification_id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "notification_type",
    },
    notification_target : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
    },
    created_at : {
        type : Date,
        default : new Date()
    },
    watched : {
        type : Boolean,
        default : false
    }
});

const Notification = mongoose.model("nofitication" , notification);
module.exports = Notification;