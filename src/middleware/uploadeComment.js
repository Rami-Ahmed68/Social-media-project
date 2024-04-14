const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination : function (req , res , cb) {
        cb(null , path.join(__dirname , "../../images"));
    },
    filename : function (req , file , cb) {
        cb(null , new Date().toISOString().replace(/:/g , "-") + file.originalname);
    }
});


const uploade = multer({
    storage : storage,
    fileFilter : function (req , file , callback) {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
            callback(null , true);
        } else {
            console.log("Only Jpg && Png file supported");
            callback(null , false);
        }
    }
}).array("images" , 6);

module.exports = uploade;