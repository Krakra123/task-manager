const express = require('express');
const router = express.Router();

const boardManager = require("../src/board-manager");

router.get('/board', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (!req.session.board) {
        try {
            const fBoard = await boardManager.getFirstBoard();
            req.session.board = fBoard.title;
        } catch (err) {
            console.error('Error boarding', err);
        }
    }

    const locals = {
        boardName: req.session.board,
    }

    res.render('board/board', locals);
})

router.post('/board/create-col', async (req, res) => {
    await boardManager.createColumn(req.session.board, req.body.columnName);
})

module.exports = router;