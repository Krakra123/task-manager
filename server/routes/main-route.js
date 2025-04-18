const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const locals = {
        user: req.session.user
    }

    // FIXME
    if (req.session.user) {
        res.redirect('/board');
    } else {
        res.render('index', locals);
    }
});

const authRoutes = require('./auth-route');
const boardRoutes = require('./board-route');
const taskRoutes = require('./task-route');

router.use('/', authRoutes);
router.use('/', boardRoutes);
router.use('/', taskRoutes);

module.exports = router;