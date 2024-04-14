const winston = require("winston");
require("winston-mongodb");
const dotenv = require("dotenv");
dotenv.config({ path : "../confige.env" });

const logger = winston.createLogger({
    level : "error",
    format : winston.format.json(),
    transports : [
        new winston.transports.File({ 
            filename : "error.log" 
            , level : 'error' 
            , format : winston.format.combine(winston.format.timestamp() , winston.format.json()
        )}),
        new winston.transports.MongoDB({
            level : "info" ,
            options : { useUnifiedTopology: true },
            db : process.env.DATA_BASE,
        })
    ]
});

module.exports = logger;