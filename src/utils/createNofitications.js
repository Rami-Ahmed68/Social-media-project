// const express = re


const Notification = require("../models/nofitication/notifications");


const CreateNotification = async function (name , type , nofId , target , auth) {
    if (auth == true) {
        const notification = new Notification({
            "message" : type == "comment" 
            ? `${name} commented on your post` 
            : type == "replie" 
            ? `${name} replyed to your comment` 
            : type == "user"
            ? `${name} accepted the friend request` 
            :`${name} liked your post`,
            "notification_type" : type == "friend" ? "user" : type,
            'notification_id' : nofId,
            "notification_target" : target,
        });

        // save the nof
        await notification.save();
        let notificationId = notification._id;
        return notificationId
    };
};

module.exports = CreateNotification;