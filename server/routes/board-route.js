const express = require('express');
const router = express.Router();

const boardManager = require("../src/board-manager");

router.get('/board', (req, res) => {
    const locals = {
        boardName: req.query.boardName,
    }

    res.render('board/board', locals);
})

router.get('/board/create', (req, res) => {
    boardManager.createBoard(req.query.boardName);
})
router.get('/board/delete', (req, res) => {
    boardManager.deleteBoard(req.query.boardName);
})

router.get('/board/create-col', (req, res) => {
    boardManager.createColumn(req.query.boardName, req.query.columnName);
})
router.get('/board/delete-col', (req, res) => {
    boardManager.deleteColumn(req.query.boardName, req.query.columnIndex);
})

module.exports = router;