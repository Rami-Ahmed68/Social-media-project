const bcrypt = require("bcrypt");

const HashingPassword = async function (saltRounds , password) {
    const salt = await bcrypt.genSalt(saltRounds);
    return password = bcrypt.hash(password , salt);
};

module.exports = HashingPassword;