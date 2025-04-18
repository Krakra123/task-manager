const express = require('express');
const router = express.Router();

const taskManager = require("../src/task-manager");

router.post('/task/create-task', async (req, res) => {
    try {
        const { columnID, taskName } = req.body;

        const task = await taskManager.createTask(columnID, taskName);

        if (!task) {
            return res.status(500).json({ error: 'Failed to create task' });
        }

        res.status(201).json(task);
    } catch (err) {
        console.error('Error creating task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/task/delete-task', async (req, res) => {
    try {
        const taskID = req.body.taskID;

        res.json(await taskManager.deleteTask(taskID));
    } catch (err) {
        console.error('Error deleting task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/task/move-task', async (req, res) => {
    try {
        const { taskID, columnID, index } = req.body;

        res.json(await taskManager.moveTask(taskID, columnID, index));
    } catch (err) {
        console.error('Error moving task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/task/get-all-task-in-column', async (req, res) => {
    try {
        const columnID = req.body.columnID;

        const tasks = await taskManager.getAllTask(columnID);
        if (!tasks) {
            return res.status(500).json({ error: `Failed to get all task in ${columnID}` });
        }

        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error get all tasks task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/task/edit-task', async (req, res) => {
    try {
        const taskID = req.body.taskID;

        const task = await taskManager.getTaskById(taskID);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/task/save-task', async (req, res) => {
    try {
        const taskID = req.body.taskID;
        const updatedTask = await taskManager.updateTask(taskID, req.body);
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/task/add-bind-user-to-task', async (req, res) => {
    try {
        const { userID, taskID } = req.body;

        const result = await taskManager.addBindUserToTask(userID, taskID);

        if (!result) {
            return res.status(500).json({ error: 'Failed to bind user to task' });
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('Error binding user to task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/task/remove-bind-user-to-task', async (req, res) => {
    try {
        const { userID, taskID } = req.body;

        const result = await taskManager.removeBindUserFromTask(userID, taskID);

        if (!result) {
            return res.status(500).json({ error: 'Failed to remove user binding from task' });
        }

        res.status(200).json(result);
    } catch (err) {
        console.error('Error removing user binding from task:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/task-test', async (req, res) => {
    // await taskManager.createTask("67ffe98e2eea0d4a983c623c", "test task");
    await fetch('http://localhost:3000/task/edit-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            taskID: req.query.taskID,
        })
    });
    res.send('ok');
});

module.exports = router;