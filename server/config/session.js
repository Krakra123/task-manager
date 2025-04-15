const express=require('express');
const session=require('express-session');

const createSession = (app) => {
    app.use(session({
        name: 'main-session',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 7
        }
    }));
}

module.exports = createSession;