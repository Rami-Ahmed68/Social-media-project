const cloudinary = require("cloudinary");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path : "../../confige.env" });

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET
});

// uploading function
const cloudinaryUploading = async (file) => {

    try {
        // catch the file path
        const imagePath = path.join(__dirname , `../../images/${file.filename}`);

        // upload file
        const data = await cloudinary.uploader.upload(imagePath , {
            resource_type : "auto",
        });

        return data.secure_url;

    } catch (error) {
        return error;
    }
};

module.exports = cloudinaryUploading;