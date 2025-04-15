const express = require('express');
const router = express.Router();

router.get('/api/get-user', (req, res) => {
    res.send(req.session.user);
});