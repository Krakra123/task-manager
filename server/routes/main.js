const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const locals = {
        title: 'Hoc',
        description: 'Koc nua ',
        user: req.session.user
    }

    res.render('index', locals);
});

router.get('/login', (req, res) => {
    req.session.user = 'abc';
    res.redirect('/');
})

router.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
})

module.exports = router;