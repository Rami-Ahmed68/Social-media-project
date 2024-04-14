const dotenv = require("dotenv");
dotenv.config({ path : "../../confige.env" });

const jwt = require("jsonwebtoken");
const ApiErrors = require("./apiErrors");

const VerifyTokenData = async (header , next) => {
    // catch the authorization
    const authHeader = header;

    // check if the authHeader exists and start with "Bearer"
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return next(new ApiErrors("Invalid Authorization header format ..." , 401));
    }

    // extract the token from authHeader
    const token = authHeader.split(' ')[1];

    // check if the is exists or not
    if (!token) {
        return next(new ApiErrors("Token Is Required ..." , 404));
    }

    // extract the data from token
    const Data = jwt.verify(token , process.env.JWT_PUBLIC_KEY);

    // return the data 
    return Data;
}

module.exports = VerifyTokenData;