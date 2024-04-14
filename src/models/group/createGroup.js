const mongoose = require("mongoose");

const group = new mongoose.Schema({
    title : {
        type : String,
        min : 3,
        max : 100
    },
    created_by : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : "user"
    },
    created_at : {
        type : Date,
        defualt : new Date()
    },
    saved : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "post",
        default : []
    }]
});

const Group = mongoose.model("group" , group);

module.exports = Group;