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
        user: req.session.user,
        boardName: req.session.board,
    }

    res.render('board/board', locals);
})

router.post('/board/get-all-cols', async (req, res) => {
    const data = await boardManager.getAllColumn(req.session.board);
    res.json(data);
});

router.post('/board/create-col', async (req, res) => {
    res.json(boardManager.createColumn(req.session.board, req.body.columnName));
})

router.post('/board/delete-col', async (req, res) => {

})

module.exports = router;