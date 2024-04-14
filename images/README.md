Hello ...
my name is Rami Ahmed
I hope this project helps you with some additional information

** my english isn'ot verey good (-_-) sorry

------- Here is all this project API'S -------
	------- Auth API'S start -------
	http://localhost:your-Project-Port/users/register : type : post
	http://localhost:your-Project-Port/users/login : type : post
	http://localhost:your-Project-Port/users/delete : type : delete
	http://localhost:your-Project-Port/users/update : type : put
	------- Auth API'S end -------

	------- users API'S start -------
	http://localhost:your-Project-Port/user : tyep : get
	http://localhost:your-Project-Port/users : type : get
	http://localhost:your-Project-Port/users/profile : type : get
	------- users API'S end -------

	------- post API'S strat -------
	http://localhost:your-Project-Port/posts/create : type : post
	http://localhost:your-Project-Port/posts : type : get
	http://localhost:your-Project-Port/posts/all : type : get
	http://localhost:your-Project-Port/posts/delete : type : delete
	http://localhost:your-Project-Port/posts/update : type : put
	------- post API'S end -------

	------- like API'S start -------
	http://localhost:your-Project-Port/like/add : type : post
	http://localhost:your-Project-Port/like/delete : type : delete
	http://localhost:your-Project-Port/like/update : type : put
	http://localhost:your-Project-Port/like/all : type : get
	http://localhost:your-Project-Port/like/mylikes : type : get
	------- like API'S end -------

	------- notification API'S start -------
	http://localhost:your-Project-Port/notifications : type : get
	http://localhost:your-Project-Port/notifications/update : type : put
	http://localhost:your-Project-Port/notifications/delete : type : delete
	------- notification API'S end -------

	------- comment API'S start -------
	http://localhost:your-Project-Port/comment/create : type : post
	http://localhost:your-Project-Port/comment/delete : type : delete
	http://localhost:your-Project-Port/comment/update : type : put
	http://localhost:your-Project-Port/comment/all : type : get
	http://localhost:your-Project-Port/reply/create : type : post
	http://localhost:your-Project-Port/replyto/create : type : post
	http://localhost:your-Project-Port/reply/update : type : put
	http://localhost:your-Project-Port/reply/delete : type : delete
	http://localhost:your-Project-Port/subreply : type : get
	------- comment API'S end -------

	------- group API'S start -------
	http://localhost:your-Project-Port/group/create : type : post
	http://localhost:your-Project-Port/group/delete : type : delete
	http://localhost:your-Project-Port/group/update : type : update
	http://localhost:your-Project-Port/group : type : get
	http://localhost:your-Project-Port/group/all : type : get
	http://localhost:your-Project-Port/group/save : type : put
	http://localhost:your-Project-Port/group/unsave : type : put
	------- group API'S end -------

	------- friends request API'S start -------
	http://localhost:your-Project-Port/request/send : type : post
	http://localhost:your-Project-Port/request/delete : type : delete
	http://localhost:your-Project-Port/request/all : type : get
	http://localhost:your-Project-Port/request/confirm : type : put
	http://localhost:your-Project-Port/request/reject : type : put
	http://localhost:your-Project-Port/request/unfriend : type : put
	------- friends request API'S end -------

	------- Search API -------
	http://localhost:your-Project-Port/search : type : get
	------- Search API -------

What data should you send in any request such as json format


////////////////////////////// Auth Start //////////////////////////////

------- Register -------
Important data to register successfully 

API : http://localhost:your-Project-Port/users/register

formdata : {
	name : String , required , minlength : 3 , maxlength : 50
	age : Date , required , minlength : 2004-01-01 , maxlength : 1974-01-01
	email : required , minlength : 10 , maxlength : 30
	password : required , minlength : 8 , maxlength : 100
	avatar : file , optional
}
------- Register -------

------- Login -------
important data to login successfully

API : http://localhost:your-Project-Port/users/login

body : {
	email : required , minlength : 10 , maxlength : 30
	password : required , minlength : 8 , maxlength : 100
}

headers : {
	authorization : Bearer + + token , is required
}
------- Login -------

------- Delete user -------
important data to dlete user successfully 

API : http://localhost:your-Project-Port/users/delete

body : {
	email : minlength : 10 , maxlength : 30 , required 
	password : minlength : 8 , maxlength : 100 , required
}
------- Delete user -------

------- Update user -------
important data to update user account successfully

API : http://localhost:your-Project-Port/users/update

body : {
	name : optional,
	age : optional,
	password : optional,
	images : optional,
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- Update user -------

////////////////////////////// Auth End //////////////////////////////

////////////////////////////// User Start /////////////////////////////

------- get all users -------
important data to get all users successfully 

API : http://localhost:your-Project-Port/users

body : {
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get all users -------

------- get user -------
important data to get uset successfully

API : http://localhost:your-Project-Port/user

body : {
	userId : required,
	userTargetId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get user -------

------- show profile -------
important data to show profile successfully

API : http://localhost:your-Project-Port/users/profile

body : {
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- show profile -------

////////////////////////////// User End //////////////////////////////

////////////////////////////// Post Start /////////////////////////////

------- create post -------
important data to create post successfully

API : http://localhost:your-Project-Port/posts/create

body : {
	title : required,
	images : optional,
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- create post -------

------- update post -------
important data to update post successfully

API : http://localhost:your-Project-Port/posts/update

body : {
	title : optional,
	images : optional,
	postId : required,
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- update post -------

------- delete post -------
important data to delete post successfully

API : http://localhost:your-Project-Port/posts/delete

body : {
	userId : required,
	postId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- delete post -------

------- get post -------
important data to get post successfully

API : http://localhost:your-Project-Port/posts

body : {
	postId : required,
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}

------- get all posts -------
important data to get all posts successfully

API : http://localhost:your-Project-Port/posts/all

body : {
	userId : required
}

queer : {
	page : page number,
	limit documents limite of posts: 
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get all posts -------

////////////////////////////// Post End //////////////////////////////



////////////////////////////// Like Start //////////////////////////////

------- create like -------
importanat data to create like successfully

API : http://localhost:your-Project-Port/like/add

body : {
	userId : required,
	postId : required,
	reactionType : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- create like -------

------- update like -------
importanat data to update like successfully

API :http://localhost:your-Project-Port/like/update

body : {
	userId : required,
	likeId : required,
	reactionType : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- update like -------

------- delete like -------
important data to delete like successfully

API : http://localhost:your-Project-Port/like/delete

body : {
	userId : required,
	likeId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- delete like -------

------- get post's likes -------
important data to get all post's likes successfully

API : http://localhost:your-Project-Port/like/all

body : {
	userId : required,
	postId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get post's likes -------

------- get user's likes -------
important data to get user's likes seuccessfully

API : http://localhost:your-Project-Port/like/mylikes

body : {
	userId : required
}

headers : {
	Authorization : Bearer + + token , id required
}
------- get user's likes -------

------- get user's likes -------


////////////////////////////// Like End //////////////////////////////


////////////////////////////// Comment Start //////////////////////////////

------- create comment -------
important data to craete a comment successfully

API : http://localhost:your-Project-Port/comment/create

body : {
	body : optional,
	images : optional,
	userId : required,
	postId : required
}

headers : {
	Authorization : Bearer + + token , is required
}

note : you should add body or image in comment to created
------- create comment -------

------- update comment -------
important data to update comment successfully

API : http://localhost:your-Project-Port/comment/update

body : {
	body : optional,
	images : optional
	userId : required,
	commentId : required,
}

headers : {
	Authorization : Bearer + + token , is required
}
------- update comment -------

------- delete comment -------
important data to delete comment successfully

API : http://localhost:your-Project-Port/comment/delete

body : {
	userId : required,
	commentId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- delete comment -------

------- get post's comments -------
important data to get post's comments successfully

API : http://localhost:your-Project-Port/comment/all

body : {
	postId : required,
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get post's comments -------

------- create reply to comment -------
important data for reply to comment successfully

API : http://localhost:your-Project-Port/reply/create

body : {
	body : optional,
	images : optional,
	commentId : required,
	userId : required,
	postId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- create reply to comment -------

------- update reply -------
important data to update reply successfully

API : http://localhost:your-Project-Port/reply/update

body : {
	body : optional,
	images : optional,
	userId : required,
	replyId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- update reply -------

------- reply to reply -------
important data for reply to reply successfully

API : http://localhost:your-Project-Port/replyto/create

body : {
	body : optional,
	images : optional,
	replyId : required,
	userId : required,
	postId : required
}

headers : {
	Authorization : Bearer + + token , is required
}

note : you shoud send body or images in request 
------- reply to reply -------

------- get replies -------
important data to get replies successfully

API : http://localhost:your-Project-Port/replysubreply

body : {
	replyId : required,
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get replies -------

////////////////////////////// Comment End //////////////////////////////


////////////////////////////// Group Start //////////////////////////////

------- create group -------
important data to create group successfully

API : http://localhost:your-Project-Port/group/create

body : {
	title : required,
	userId : required,
}

headers : {
	Authorization : Bearer + + token , is required
}
------- create group -------

------- update group -------
important data to update group successfully

API : http://localhost:your-Project-Port/group/update
body : {
	title : required,
	userId : required,
	groupId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- update group -------

------- delete group -------
important data to delete group successfully

API : http://localhost:your-Project-Port/group/delete

body : {
	userId : required,
	groupId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- delete group -------

------- get all user group -------
important data to get all user groups successfully

API : http://localhost:your-Project-Port/group/all

body : {
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get all user group -------

------- get user group -------
important data to get user group successfully

API : http://localhost:your-Project-Port/group

body : {
	userId : required,
	groupId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get user group -------

------- save the post in group -------
important data to save the post in group successfully

API : http://localhost:your-Project-Port/group/save

body : {
	userId : required,
	groupId : required,
	postId : required,
}

headers : {
	Authorization : Bearer + + token , is required
}
------- save the post in group -------

------- unsave the post ( delete the post id from group ) -------
importatant data to delete the post from group successfully

API : http://localhost:your-Project-Port/group/unsave

body : {
	userId : required,
	postId : required,
	groupId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- unsave the post ( delete the post id from group ) -------

////////////////////////////// Group End //////////////////////////////

////////////////////////////// Notification Start //////////////////////////////

------- get all user notifications -------
important data to get all user's notifications

API : http://localhost:your-Project-Port/notifications/delete

body : {
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get all user notifications -------


------- delete notification -------
importatant data to delete notification successfully

API : http://localhost:your-Project-Port/notifications

body : {
	userId : required,
	notificationId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- delete notification -------

------- update notification -------
important data to update notification successfully

API : http://localhost:your-Project-Port/notifications/update

body : {
	userId : required,
	notificationId : required
}

headers : {
	Authorization : Bearer + + token , is required
}

note : you should use this api to update notificatio's  status flag from false to true whene user click on the notification
------- update notification -------

////////////////////////////// Notification End //////////////////////////////

////////////////////////////// Friend Request End //////////////////////////////

------- send friends request -------
important data to send friends request successfully

API : http://localhost:your-Project-Port/request/send

body : {
	sender : required,
	future : required
}

headers :{
	Authorization : Bearer + + token , is required
}
note : sender he is the user sende the friends request , 
future he is the friends request target
the sender and future in body should be id 
------- send friends request -------

------- delete friends request by his author -------
important data to delete friends request by his author successfully

API : http://localhost:your-Project-Port/request/delete

body : {
	sender : required,
	future : required
}

headers : {
	Authorization : Bearer + + token , is required
}
note : Only the request sender can delete it 
------- delete friends request by his author -------

------- reject friend request -------
important data to reject request successfully

API : http://localhost:your-Project-Port/request/sendreject

body : {
	userId : required,
	requestId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
note : Only the recipient of the order can cancel it
------- reject friend request -------

------- confirm friend request -------
important data to confirm request seccessfully

API : http://localhost:your-Project-Port/request/confirm

body : {
	userID : required,
	requestId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
note : Only the receiver of the request can confirm the request
------- confirm friend request -------

------- get all user friends requests -------
important data to get all user friends requests successfully

API : http://localhost:your-Project-Port/request/all

body : {
	userId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
------- get all user friends requests -------

------- Unfriend -------
important data to unfriend successfully

API : http://localhost:your-Project-Port/request/unfriend

body : {
	userId : required,
	friendId : required
}

headers : {
	Authorization : Bearer + + token , is required
}
note : Anyone can unfriend anyone else, but they must be friends
------- Unfriend -------

////////////////////////////// Friend Request Start //////////////////////////////

////////////////////////////// Searching Start //////////////////////////////

important data To search for users and posts successfully
------- search -------
API : http://localhost:your-Project-Port/search

body : {
	userId : required,
	key : required,
	path : optional
}

headers : {
	Authorization: Bearer + + token , is required
}
------- search -------
////////////////////////////// Searching Start //////////////////////////////
