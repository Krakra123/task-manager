const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const locals = {
        user: req.session.user
    }

    res.render('index', locals);
});

const authRoutes = require('./auth');

router.use('/', authRoutes);

module.exports = router;