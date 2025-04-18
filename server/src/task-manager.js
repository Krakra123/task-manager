const columnCollection = require("../models/board-model").boardColumnCollection;
const taskCollection = require("../models/board-model").taskCollection;

const createTask = async (columnID, taskName) => {
    try {
        const column = await columnCollection.findOne({ _id: columnID });

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
        await column.save();

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
        return tasks.tasks;
    } catch (err) {
        console.error("Error getting all task: ", err.message);
    }
}

const updateTask = async (taskID, updates) => {
    try {
        // Find the task by ID
        const task = await taskCollection.findOne({_id: taskID});
        if (!task) {
            console.error("Error updating task: Task not found.");
            return null;
        }

        // Update the task with the provided fields
        Object.keys(updates).forEach((key) => {
            task[key] = updates[key];
        });

        // Save the updated task
        task.updatedAt = new Date();
        await task.save();

        console.log(`Updated task "${taskID}" successfully.`);
        return task;
    } catch (err) {
        console.error("Error updating task: ", err.message);
        throw err;
    }
};

module.exports = {
    createTask,
    deleteTask,
    getTaskById,
    getTaskIDByIndex,
    getAllTaskID,
    getAllTask,
    updateTask,
};
