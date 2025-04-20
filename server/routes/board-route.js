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
    const column = await boardManager.createColumn(req.session.board, req.body.columnName);
    res.json(column);
});

router.post('/board/delete-col', async (req, res) => {
    await boardManager.deleteColumn(req.body.columnID);
    res.json({ message: "Column deleted successfully" });
});

router.post('/board/update-column-order', async (req, res) => {
    try {
        const { columnOrder } = req.body;
        const result = await boardManager.updateColumnOrder(req.session.board, columnOrder);
        res.json(result);
    } catch (err) {
        console.error("Error updating column order:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;