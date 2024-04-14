const multer = require('multer');
const path = require("path");

const dotenv = require("dotenv");
dotenv.config({ path : "../../confige.env" });


const storage = multer.diskStorage({
    destination : function (req , file , callback) {
        callback(null , path.join(__dirname , "../../images"))
    },
    filename : function (req , file , callback) {
        callback(null , new Date().toISOString().replace(/:/g , "-") + file.originalname);
    }
});

const upload = multer({
    storage : storage,
    fileFilter : function (req , file , callback) {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
            callback(null , true);
        } else {
            console.log("Only Jpg & Png file supported");
            callback(null , false);
        }
    }
}).array("avatar" , 1)

module.exports = upload; 