const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const dotenv = require("dotenv");
dotenv.config({ path : './confige.env' });
const logger = require("./config/logger");

const ApiErrors = require("./src/utils/apiErrors");
const Global = require("./src/middleware/error");
const AutoDeleteNotifications = require("./src/middleware/autoDeleteNotifications");

const cors = require("cors");
const corsOptions = {
    origin: "*",
    methods: "GET,PUT,POST,DELETE",
};

app.use(cors(corsOptions)); // أضف هذا في بداية الملف


// ------ run delete notifications function every hour start ------
setInterval(AutoDeleteNotifications , 3600000);
// ------ run delete notifications function every hour end ------

// ------ Require User start ------
const RegisterRouter = require("./src/router/Auth/register");
const LoginRouter = require("./src/router/Auth/login");
const DeleteUser = require("./src/router/Auth/delete");
const UpdateUser = require("./src/router/Auth/update");
const Getuser = require("./src/router/Users/getuser");
const Getusers = require("./src/router/Users/getallusers");
const GetUserProfile = require("./src/router/Users/showprofile");
// ------ Require User end ------

// ------ Require Post start ------
const Createpost = require("./src/router/Posts/createPost");
const GetAllPosts = require("./src/router/Posts/getAllPosts");
const GetPost = require("./src/router/Posts/getPost");
const DeletePost = require("./src/router/Posts/deletePost");
const Updatepost = require("./src/router/Posts/updatePost");
// ------ Require Post end ------

// ------ Require Like start ------
const CreateLike = require("./src/router/Likes/createLike");
const DeleteLike = require("./src/router/Likes/deleteLike");
const UpdateLike = require("./src/router/Likes/updateLike");
const GetPostLikes = require("./src/router/Likes/getPostLikes");
const GetUserLikes = require("./src/router/Likes/getUserLikes");
// ------ Require Like end ------

// ------ Require comment end ------
const CreateComment = require("./src/router/Comments/createComment");
const DeleteComment = require("./src/router/Comments/deleteComment");
const UpdateComment = require("./src/router/Comments/updateComment");
const ReplyComment = require("./src/router/Comments/replyComment");
const ReplyToReply = require("./src/router/Comments/reply-to-reply");
const UpdateReply = require("./src/router/Comments/updateReply");
const DeleteReply = require("./src/router/Comments/deleteReply");
const GetAllPostComments = require("./src/router/Comments/getPostComments");
const GetSubReplies = require("./src/router/Comments/getReplies");
// ------ Require comment end ------

// ------ Require Nofitications start ------
const GetuserNofitications = require("./src/router/nofitications/getNofitications");
const UpdateNotifications = require("./src/router/nofitications/updateNotification");
const DeleteNotification = require("./src/router/nofitications/deleteNotification");
// ------ Require Nofitications end ------

// ------ Require Save Group start ------
const CreateGroup = require("./src/router/Group/createGroup");
const DeleteGroup = require("./src/router/Group/deleteGroup");
const UpdateGroup = require("./src/router/Group/updateGroup");
const GetGroup = require("./src/router/Group/getGroup");
const GetAllGroups = require("./src/router/Group/getAllGroups");
const SavePostInGroup = require("./src/router/Group/savePostInGroup");
const DeletePostFromGroup = require("./src/router/Group/UnSavePostInGroup");
// ------ Require Save Group end ------

// ------ Require Friends Request Start ------
const CreateRequest = require("./src/router/FriendsReguests/sendRequest");
const DeleteRequest = require("./src/router/FriendsReguests/deleteRequest");
const GetAllUserRequests = require("./src/router/FriendsReguests/getAllUserRequests");
const ConfirmRequest = require("./src/router/FriendsReguests/confirmRequst");
const RejectFriend = require("./src/router/FriendsReguests/rejectFriend");
const UsFriend = require("./src/router/FriendsReguests/unfriend");
// ------ Require Friends Request end ------

// ------ Require Searching start ------
const Searching = require("./src/router/search/search");
// ------ Require Searching end ------

app.use(express.json());

// static files
app.use( express.static(path.join(__dirname , ("../images"))));
app.use( express.static(path.join(__dirname , "../commentImages")));
app.use( express.static(path.join(__dirname , "../Postsimages")));

// ------ Auth start ------
app.use("/users/register" , RegisterRouter);
app.use("/users/login" , LoginRouter);
app.use("/users/delete" , DeleteUser);
app.use("/users/update" , UpdateUser)
// ------ Auth end ------

// ------ Users start ------
app.use("/user" , Getuser);
app.use("/users" , Getusers);
app.use("/profile" , GetUserProfile);
// ------ Users end ------

// ------ Posts start ------
app.use("/posts/create" , Createpost);
app.use("/posts/all" , GetAllPosts);
app.use("/posts" , GetPost);
app.use("/posts/delete" , DeletePost);
app.use("/posts/update" , Updatepost);
// ------ Posts end ------

// ------ Likes start ------
app.use("/like/add" , CreateLike);
app.use("/like/delete" , DeleteLike);
app.use("/like/update" , UpdateLike);
app.use("/like/all" , GetPostLikes);
app.use("/like/mylikes" , GetUserLikes);
// ------ Likes end ------

// ------ Nofitications start ------
app.use("/notifications" , GetuserNofitications);
app.use("/notifications/update" , UpdateNotifications);
app.use("/notifications/delete" , DeleteNotification)
// ------ Nofitications end ------

// ------ Comment start ------
app.use("/comment/create" , CreateComment);
app.use("/comment/delete" , DeleteComment);
app.use("/comment/update" , UpdateComment);
app.use("/comment/all" , GetAllPostComments);
app.use("/reply/create" , ReplyComment);
app.use("/replyto/create" , ReplyToReply);
app.use("/reply/update" , UpdateReply);
app.use("/reply/delete" , DeleteReply);
app.use("/subreply" , GetSubReplies);
// ------ Comment end ------

// ------ Group start ------
app.use("/group/create" , CreateGroup);
app.use("/group/delete" , DeleteGroup);
app.use("/group/update" , UpdateGroup);
app.use("/group" , GetGroup);
app.use("/group/all" , GetAllGroups);
app.use("/group/save" , SavePostInGroup);
app.use("/group/unsave" , DeletePostFromGroup);
// ------ Group end ------

// ------ Request start ------
app.use("/request/send" , CreateRequest);
app.use("/request/delete" , DeleteRequest);
app.use("/request/all" , GetAllUserRequests);
app.use("/request/confirm" , ConfirmRequest);
app.use("/request/reject" , RejectFriend);
app.use("/request/unfriend" , UsFriend);
// ------ Request end ------

// ------ Searching start ------
app.use("/search" , Searching);
// ------ Searching end ------

app.use(express.urlencoded({ extended: true }));

// Create error and send it to error handling middlware
app.all("*" , (req , res , next) => {
    return next(new ApiErrors("Api Not Found ..." , 404));
});

// Global error handling middlware
app.use(Global)

// connect the project to data base
mongoose.connect(process.env.DATA_BASE)
.then(() => {
    console.log("########## Conected to data base ##########")
})
.catch((error) => {
    logger.error(`Check Your DataBase The Error Is : ${error}`);
});

// run the project on port in the .env file
app.listen(process.env.PORT , () => {
    logger.info(`Server Working On Port ${process.env.PORT}`);
})