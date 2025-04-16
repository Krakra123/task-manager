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
        }

        const newColumn = new columnCollection({
            title: columnName,
            board: board._id
        });
        await newColumn.save();

        board.columns.push(newColumn._id);
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
        const column = await columnCollection.findOne({_id: columnID});
        if (!column) {
            console.error("Error deleting column: Column not found.");
        }

        const board = await boardCollection.findOne({_id: column.board});

        board.columns = board.columns.filter(col => col._id !== columnID);
        board.updatedAt = new Date();
        await board.save();

        await columnCollection.deleteOne({_id: columnID});
        console.log(`Deleted column ${columnID}".`);
    } catch (err) {
        console.error("Error deleting column: ", err.message);
    }
}
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
        const columns = await boardCollection.findOne({title: boardName}).populate('columns');
        if (!columns) {
            console.error(`Error getting all column: Board ${boardName} not found.`);
        }
        return columns;
    } catch (err) {
        console.error("Error getting all column: ", err.message);
    }
}

const createTask = async (columnID, taskName) => {
    try {
        const column = await columnCollection.findOne({_id: columnID});
        if (!column) {
            console.error("Error creating task: Column not found.");
        }

        const newTask = new taskCollection({
            title: taskName,
            column: columnID
        });
        await newTask.save();

        column.tasks.push(newTask._id);
        column.updatedAt = new Date();
        await board.save();

        console.log(`Created task "${taskName}" added to column "${columnID}".`);
        return newTask;
    } catch (err) {
        console.error("Error creating task: ", err.message);
    }
}
const deleteTask = async (taskID) => {
    try {
        const task = await taskCollection.findOne({_id: taskID});
        if (!task) {
            console.error("Error deleting task: Column not found.");
        }

        const column = await columnCollection.findOne({_id: task.column});

        column.tasks = column.tasks.filter(task => task._id !== taskID);
        column.updatedAt = new Date();
        await column.save();

        await taskCollection.deleteOne({_id: taskID});
        console.log(`Deleted task ${taskID}".`);
    } catch (err) {
        console.error("Error deleting task: ", err.message);
    }
}
const getTaskById = async (taskID) => {
    return taskCollection.findOne({_id: taskID});
}
const getTaskIDByIndex = async (columnID, taskIndex) => {
    try {
        const column = await columnCollection.findOne({_id: columnID});
        if (!column) {
            console.error("Error getting task by index: Column not found.");
        }

        return column.tasks[taskIndex];
    } catch (err) {
        console.error("Error getting task by index: ", err.message);
    }
}
const getAllTaskID = async (columnID) => {
    try {
        const column = await columnCollection.findOne({_id: columnID});
        if (!column) {
            console.error("Error getting all task: Column not found.");
        }

        return column.tasks;
    } catch (err) {
        console.error("Error getting all task: ", err.message);
    }
}
const getAllTask = async (columnID) => {
    try {
        const tasks = await columnCollection.findOne({_id: columnID}).populate('tasks');
        if (!tasks) {
            console.error("Error getting all task: Column not found.");
        }
        return tasks;
    } catch (err) {
        console.error("Error getting all task: ", err.message);
    }
}

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

    createTask,
    deleteTask,
    getTaskById,
    getTaskIDByIndex,
    getAllTaskID,
    getAllTask,
};
