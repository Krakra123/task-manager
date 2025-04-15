const userCollection = require("../models/user");
const crypto = require("crypto");

const verifyUser = async (req) => {
    try {
        const check = await userCollection.findOne({
            username: req.body.username
        })

        return check.password === crypto.createHash('sha256').update(req.body.password).digest('hex');

    } catch (err) {
        console.log(`Verify failed: ${err}`);
        return false;
    }
}

const login = async (req) => {
    try {
        if (await verifyUser(req)) {
            req.session.user = {
                username: req.body.username,
            }

            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(`Login failed: ${err}`);
        return false;
    }
}

const registerUser = async (req) => {
    try {
        const data = {
            username: req.body.username,
            password: crypto.createHash('sha256').update(req.body.password).digest('hex')
        }
        await userCollection.insertOne(data)

        return true;
    } catch (err) {
        console.log(`Register failed: ${err}`);
        return false;
    }
}

module.exports = {
    verifyUser,
    login,
    registerUser
}