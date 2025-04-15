const boardCollection = require("../models/board-model").boardCollection;
const boardColumnCollection = require("../models/board-model").boardColumnCollection;

const hasBoard = async (boardName) => {
    const find = await boardCollection.findOne({title: boardName});
    return find !== null;
}

const hasColumn = async (columnName, boardName) => {
    const board = await boardCollection.findOne({title: boardName});
    if (!board) return false;

    const find = board.columns.find(col => col.title === columnName);

    return find !== null;
}

const createBoard = async (boardName) => {
    try {
        if (await hasBoard(boardName)) {
            console.error("Error creating board: Board with this name already exists.");
        }

        const newBoard = new boardCollection({title: boardName});
        await newBoard.save();

        console.log("Board created: ", newBoard);
    } catch (err) {
        console.error("Error creating board: ", err.message);
    }
};

const deleteBoard = async (boardName) => {
    try {
        const board = await boardCollection.findOne({title: boardName});
        if (!board) {
            console.error("Error delete board: Board not found.");
        }

        await boardColumnCollection.deleteMany({_id: {$in: board.columns}});
        await boardCollection.deleteOne({_id: board._id});

        console.log("Board deleted: ", boardName);
    } catch (err) {
        console.error("Error deleting board:", err.message);
    }
};

const createColumn = async (boardName, columnName) => {
    try {
        const board = await boardCollection.findOne({title: boardName});
        if (!board) {
            console.error("Error creating column: Board not found.");
        }

        const newColumn = new boardColumnCollection({title: columnName});
        await newColumn.save();

        board.columns.push(newColumn._id);
        board.updatedAt = new Date();
        await board.save();

        console.log(`Column "${columnName}" added to board "${boardName}".`);
    } catch (err) {
        console.error("Error creating column: ", err.message);
    }
};

const deleteColumn = async (boardName, columnIndex) => {
    try {
        const board = await boardCollection.findOne({title: boardName}).populate("columns");
        if (!board) {
            console.error("Error creating column: Board not found.");
        }

        const columnToRemove = board.columns[columnIndex];

        board.columns.splice(columnIndex, 1);
        board.updatedAt = new Date();
        await board.save();

        // Delete the column from the database
        await boardColumnCollection.deleteOne({ _id: columnToRemove._id });

        console.log(`Column at index ${columnIndex} deleted from board "${boardName}".`);
    } catch (err) {
        console.error("Error deleting column: ", err.message);
    }
};

module.exports = {
    createBoard,
    deleteBoard,
    createColumn,
    deleteColumn
};
