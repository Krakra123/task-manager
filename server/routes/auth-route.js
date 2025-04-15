const express = require('express');
const router = express.Router();

const auth = require("../src/auth");

router.get('/login', (req, res) => {
    const locals = {
        type: 'login',
        name: 'Login',
        errorCode: req.params.s
    }

    res.render('form/login-signup', locals);
})
router.get('/signup', (req, res) => {
    const locals = {
        type: 'signup',
        name: 'Signup',
        errorCode: req.params.s
    }

    res.render('form/login-signup', locals);
})

router.post('/login', async (req, res) => {
    try {
        if (await auth.login(req.body.username, req.body.password)) {
            req.session.user = req.body.username;
            res.redirect('/');
        } else {
            const locals = {
                type: 'login',
                name: 'Login',
                errorCode: 1
            }
            res.render('form/login-signup', locals);
        }
    } catch (err) {
        console.error(`Login error: ${err}`);
    }
})
router.post('/signup', async (req, res) => {
        try {
            if (await auth.register(req.body.username, req.body.password)) {
                const locals = {
                    type: 'login',
                    name: 'Login',
                    errorCode: 9
                }
                res.render('form/login-signup', locals);
            } else {
                const locals = {
                    type: 'signup',
                    name: 'Signup',
                    errorCode: 2
                }
                res.render('form/login-signup', locals);
            }
        } catch
            (err) {
            console.error(`Signup error: ${err}`);
        }
    }
)

router.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
})

module.exports = router;