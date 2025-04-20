const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const locals = {
        user: req.session.user
    }

    if (req.session.user) {
        res.redirect('/board');
    } else {
        res.render('index', locals);
    }
});

router.get('/api/session', (req, res) => {
    if (req.session.user) {
        res.json(req.session);
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
});

router.get('/about', (req, res) => {

    const locals = {
        user: req.session.user
    }
    res.render('index', locals);
})

const authRoutes = require('./auth-route');
const boardRoutes = require('./board-route');
const taskRoutes = require('./task-route');

router.use('/', authRoutes);
router.use('/', boardRoutes);
router.use('/', taskRoutes);

module.exports = router;