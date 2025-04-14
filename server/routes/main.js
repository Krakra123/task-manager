const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const locals = {
        title: 'Hoc',
        description: 'Koc nua ',
        user: 'testing'
    }

    res.render('index', locals);
});

module.exports = router;