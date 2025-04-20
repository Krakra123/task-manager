const boardCollection = require("../models/board-model").boardCollection;
const columnCollection = require("../models/board-model").boardColumnCollection;
const taskCollection = require("../models/board-model").taskCollection;

const createBoard = async (boardName) => {
    try {
        if (await hasBoard(boardName)) {
            console.error("Error creating board: Board with this name already exists.");
        }

        const newBoard = new boardCollection({title: boardName});
        await newBoard.save();

        console.log("Board created: ", newBoard);
        return newBoard;
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

        await columnCollection.deleteMany({_id: {$in: board.columns}});
        await boardCollection.deleteOne({_id: board._id});

        console.log("Board deleted: ", boardName);
    } catch (err) {
        console.error("Error deleting board:", err.message);
    }
};
const hasBoard = async (boardName) => {
    const find = await boardCollection.findOne({title: boardName});
    return find !== null;
}
const getFirstBoard = async () => {
    try {
        let firstBoard = await boardCollection.findOne().sort({_id: 1});
        if (!firstBoard) {
            firstBoard = await createBoard("Untitled");
        }
        return firstBoard;
    } catch (err) {
        console.error('Error getting first board:', err.message);
    }
};

const createColumn = async (boardName, columnName) => {
    try {
        const board = await boardCollection.findOne({title: boardName});
        if (!board) {
            console.error("Error creating column: Board not found.");
            return;
        }

        const newColumn = new columnCollection({
            title: columnName,
            board: board._id
        });
        await newColumn.save();

        const newOrder = board.columns && board.columns.length > 0
            ? Math.max(...board.columns.map(col => col.order || 0)) + 1
            : 0;

        board.columns.push({ _id: newColumn._id, order: newOrder });
        board.updatedAt = new Date();
        await board.save();

        console.log(`Created column "${columnName}" added to board "${boardName}".`);
        return newColumn;
    } catch (err) {
        console.error("Error creating column: ", err.message);
    }
};
const deleteColumn = async (columnID) => {
    try {
        const column = await columnCollection.findOne({ _id: columnID });
        if (!column) {
            console.error("Error deleting column: Column not found.");
            return;
        }

        const board = await boardCollection.findOne({ _id: column.board });
        if (!board) {
            console.error("Error deleting column: Board not found.");
            return;
        }

        board.columns = board.columns.filter(col => col._id.toString() !== columnID);
        board.updatedAt = new Date();
        await board.save();

        await columnCollection.deleteOne({ _id: columnID });
        console.log(`Deleted column ${columnID}.`);
    } catch (err) {
        console.error("Error deleting column: ", err.message);
    }
};
const getColumnById = async (columnID) => {
    return columnCollection.findOne({_id: columnID});
}
const getColumnIDByIndex = async (boardName, columnIndex) => {
    try {
        const board = await boardCollection.findOne({title: boardName});
        if (!board) {
            console.error("Error getting column by index: Board not found.");
        }

        return board.columns[columnIndex];
    } catch (err) {
        console.error("Error getting column by index: ", err.message);
    }
}
const getAllColumnID = async (boardName) => {
    try {
        const board = await boardCollection.findOne({title: boardName});
        if (!board) {
            console.error("Error getting all column: Board not found.");
        }

        return board.columns;
    } catch (err) {
        console.error("Error getting all column: ", err.message);
    }
}
const getAllColumn = async (boardName) => {
    try {
        const board = await boardCollection.findOne({ title: boardName }).populate('columns._id');
        if (!board) {
            console.error(`Error getting all columns: Board ${boardName} not found.`);
        }

        // // Sort columns by order
        // return board.columns.sort((a, b) => a.order - b.order).map(col => col._id);
        try {
            return board.columns.sort((a, b) => a.order - b.order).map(col => col._id);
        } catch (err) {
            console.error("Error sorting columns: ", err.message);
        }

        return board.columns.map(col => col._id);
    } catch (err) {
        console.error("Error getting all columns: ", err.message);
    }
};

const updateColumnOrder = async (boardName, columnOrder) => {
    try {
        const board = await boardCollection.findOne({ title: boardName });
        if (!board) {
            throw new Error("Board not found");
        }

        // Update the order of columns
        board.columns = board.columns.map((col) => {
            const newOrder = columnOrder.indexOf(col._id.toString());
            if (newOrder === -1) {
                throw new Error(`Column with ID ${col._id} not found in the provided order`);
            }
            return { ...col, order: newOrder };
        });

        board.markModified('columns');
        await board.save();

        return { message: "Column order updated successfully" };
    } catch (err) {
        console.error("Error updating column order:", err.message);
        throw err;
    }
};

module.exports = {
    createBoard,
    deleteBoard,
    hasBoard,
    getFirstBoard,

    createColumn,
    deleteColumn,
    getColumnById,
    getColumnIDByIndex,
    getAllColumnID,
    getAllColumn,
    updateColumnOrder,
};
