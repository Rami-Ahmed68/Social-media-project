const dotenv = require("dotenv");
dotenv.config({ path : "../../confige.env" });

const User = require("../models/user/register");
const Notification = require("../models/nofitication/notifications");

let notifications;

async function deleteNotifications() {

    // notification old
    const duration = new Date(Date.now() - 24 * 60  * 60 * 1000);

    // gett all notifications that are more than one day old
    notifications = await Notification.find({
        created_at : { $lt : duration }
    })

    // delete notification id from user nofitications array and from notification collection
    for (const notification of notifications) {

        // getting the user by his id
        const user = await User.findById(notification.notification_target);

        // delete the notification id from user's notifications
        user.nofitications = user.nofitications.filter(noti => noti != notification.id );

        // save the user after deleted the notification id from user's notifications array
        await user.save();

        // delete the notification if his old is bigger than one day and watched
        if (notification.watched == true) {
            await Notification.findByIdAndDelete( notification._id );
        }

    }
};


module.exports = deleteNotifications;