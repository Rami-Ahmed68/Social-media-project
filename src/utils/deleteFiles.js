const fs = require("fs");
const ApiErrors = require("./apiErrors");

const DeleteFiles = function(files , next) {
    files.forEach(file => {
            fs.unlink(file.path , (error) => {
                if (error) {
                    return next(new ApiErrors(error , 500));
                }
            });
    });
};

module.exports = DeleteFiles;