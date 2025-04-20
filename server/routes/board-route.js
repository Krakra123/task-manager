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

router.post('/board/get-all-boards', async (req, res) => {
    try {
        const boards = await boardManager.getAllBoards(); // <- await this
        res.json(boards);
    } catch (err) {
        console.error("Error fetching boards:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.post('/board/create', async (req, res) => {
    try {
        const {boardName} = req.body;

        if (!boardName || boardName.trim() === "") {
            return res.status(400).json({error: "Board name is required"});
        }

        const boardExists = await boardManager.hasBoard(boardName);
        if (boardExists) {
            return res.status(400).json({error: "Board with this name already exists"});
        }

        const newBoard = await boardManager.createBoard(boardName);
        res.status(201).json({message: "Board created successfully", board: newBoard});
    } catch (err) {
        console.error("Error creating board:", err.message);
        res.status(500).json({error: err.message});
    }
});

router.post('/board/switch', async (req, res) => {
    try {
        const boardName = req.body.title;
        const boardExists = await boardManager.hasBoard(boardName);

        if (!boardExists) {
            return res.status(404).json({error: "Board not found"});
        }

        req.session.board = boardName;
        res.redirect('/board');
    } catch (err) {
        console.error("Error switching board:", err.message);
        res.status(500).json({error: err.message});
    }
});

router.post('/board/delete', async (req, res) => {
    try {
        const {boardName} = req.body;

        if (!boardName || boardName.trim() === "") {
            return res.status(400).json({error: "Board name is required"});
        }

        const boardExists = await boardManager.hasBoard(boardName);
        if (!boardExists) {
            return res.status(404).json({error: "Board not found"});
        }

        await boardManager.deleteBoard(boardName);

        // If the deleted board was the active board, clear the session or switch to another board

        if (req.session.board === boardName) {
            const firstBoard = await boardManager.getFirstBoard();
            req.session.board = firstBoard ? firstBoard.title : null;

            res.json({gonnaReload: true});
        }
        else {
            res.json({gonnaReload: false});
        }


    } catch (err) {
        console.error("Error deleting board:", err.message);
        res.json({error: err.message});
    }
});

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
    res.json({message: "Column deleted successfully"});
});

router.post('/board/update-column-order', async (req, res) => {
    try {
        const {columnOrder} = req.body;
        const result = await boardManager.updateColumnOrder(req.session.board, columnOrder);
        res.json(result);
    } catch (err) {
        console.error("Error updating column order:", err.message);
        res.status(500).json({error: err.message});
    }
});

module.exports = router;