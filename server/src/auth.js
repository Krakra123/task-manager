const userCollection = require("../models/user-model");
const crypto = require("crypto");

const verify = async (username, password) => {
    try {
        const check = await userCollection.findOne({
            username: username
        })

        return check.password === crypto.createHash('sha256').update(password).digest('hex');
    } catch (err) {
        console.log(`Verify failed: ${err}`);
        return false;
    }
}

const login = async (username, password) => {
    try {
        return await verify(username, password);
    } catch (err) {
        console.log(`Login failed: ${err}`);
        return false;
    }
}

const register = async (username, password) => {
    try {
        await userCollection.insertOne({
            username: username,
            password: crypto.createHash('sha256').update(password).digest('hex')
        });

        return true;
    } catch (err) {
        console.log(`Register failed: ${err}`);
        return false;
    }
}

module.exports = {
    verify,
    login,
    register
}