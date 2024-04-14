const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config({ path : "../../confige.env" });

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.API_SECRET
});

const cloudinaryRemove = async (image) => {

    try {
        // splite the image url
        const imageData = image.split("/");

        // extract the image public Id
        const publicId = imageData[imageData.length - 1].split(".")[0];

        // delete the image from cloudinary by his public Id
        const data = await cloudinary.uploader.destroy(publicId);

        return data;
    } catch (error) {
        return error;
    }
};

module.exports = cloudinaryRemove;