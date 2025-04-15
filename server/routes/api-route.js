const express = require('express');
const router = express.Router();

router.get('/api/check-user-user', (req, res) => {
    res.send(req.body.name);
});

router.get('/api/get-user', (req, res) => {
    res.send(req.session.user);
});