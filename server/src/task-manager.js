const columnCollection = require("../models/board-model").boardColumnCollection;
const taskCollection = require("../models/board-model").taskCollection;
const userCollection = require("../models/user-model");

const createTask = async (columnID, taskName, beforeIndex = -1) => {
    try {
        const column = await columnCollection.findOne({_id: columnID});
        if (!column) {
            console.error("Error creating task: Column not found.");
        }

        const newTask = new taskCollection({
            title: taskName,
            description: "",
            column: columnID
        });
        await newTask.save();

        if (beforeIndex === -1) {
            column.tasks.push(newTask);
        } else {
            column.tasks.splice(beforeIndex, 0, newTask);
        }

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

const moveTask = async (taskID, columnID, index = -1) => {
    try {
        // Fetch the destination column, task, and origin column
        const column = await columnCollection.findOne({ _id: columnID });
        if (!column) {
            console.error(`Error moving task: Column with ID ${columnID} not found.`);
            return;
        }

        const task = await taskCollection.findOne({ _id: taskID });
        if (!task) {
            console.error(`Error moving task: Task with ID ${taskID} not found.`);
            return;
        }

        const originColumn = await columnCollection.findOne({ _id: task.column });
        if (!originColumn) {
            console.error(`Error moving task: Origin column with ID ${task.column} not found.`);
            return;
        }

        // Step 1: Remove the task from the origin column
        await columnCollection.updateOne(
            { _id: task.column },
            { $pull: { tasks: taskID } }
        );

        // Step 2: Update the task column reference
        await taskCollection.updateOne(
            { _id: taskID },
            { $set: { column: column._id } }
        );

        // Step 3: Insert the task into the new column at the desired index
        if (index === -1) {
            // Insert at the end of the tasks array
            await columnCollection.updateOne(
                { _id: columnID },
                { $push: { tasks: taskID } }
            );
        } else {
            // Insert at the specific index in the tasks array
            await columnCollection.updateOne(
                { _id: columnID },
                {
                    $push: {
                        tasks: {
                            $each: [taskID],
                            $position: index
                        }
                    }
                }
            );
        }

        // Step 4: Update the updatedAt timestamps
        await columnCollection.updateOne(
            { _id: columnID },
            { $set: { updatedAt: new Date() } }
        );

        await columnCollection.updateOne(
            { _id: originColumn._id },
            { $set: { updatedAt: new Date() } }
        );

        await taskCollection.updateOne(
            { _id: taskID },
            { $set: { updatedAt: new Date() } }
        );

        console.log(`Successfully moved task ${taskID} from column ${originColumn._id} to column ${columnID} at index ${index}`);

        return task;
    } catch (err) {
        console.error("Error moving task:", err);
    }
};


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

const addBindUserToTask = async (userID, taskID) => {
    try {
        // Find the user and task
        const user = await userCollection.findOne({ _id: userID });
        const task = await taskCollection.findOne({ _id: taskID });

        if (!user) {
            console.error(`Error binding user to task: User with ID ${userID} not found.`);
            return null;
        }

        if (!task) {
            console.error(`Error binding user to task: Task with ID ${taskID} not found.`);
            return null;
        }

        // Add the user to the task's users array if not already present
        if (!task.users.includes(userID)) {
            task.users.push(userID);
            task.updatedAt = new Date();
            await task.save();
        }

        // Add the task to the user's tasks array if not already present
        if (!user.tasks.includes(taskID)) {
            user.tasks.push(taskID);
            await user.save();
        }

        console.log(`Successfully bound user ${userID} to task ${taskID}.`);
        return { user, task };
    } catch (err) {
        console.error("Error binding user to task:", err.message);
        throw err;
    }
};

const removeBindUserFromTask = async (userID, taskID) => {
    try {
        const user = await userCollection.findOne({ _id: userID });
        const task = await taskCollection.findOne({ _id: taskID });

        if (!user) {
            console.error(`Error removing user binding: User with ID ${userID} not found.`);
            return null;
        }

        if (!task) {
            console.error(`Error removing user binding: Task with ID ${taskID} not found.`);
            return null;
        }

        // Remove the user from the task's users array
        task.users = task.users.filter(id => id.toString() !== userID);
        task.updatedAt = new Date();
        await task.save();

        // Remove the task from the user's tasks array
        user.tasks = user.tasks.filter(id => id.toString() !== taskID);
        await user.save();

        console.log(`Successfully removed binding of user ${userID} from task ${taskID}.`);
        return { user, task };
    } catch (err) {
        console.error("Error removing user binding from task:", err.message);
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
    moveTask,
    updateTask,
    addBindUserToTask,
    removeBindUserFromTask,

    taskCollection,
};
