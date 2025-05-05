// app.js (or wherever you want to add the route)
require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const {OpenAI} = require('openai');

const connectDB = require('./server/config/db');
const createSession = require('./server/config/session');

const app = express();
const PORT = process.env.PORT || 3000;

// initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

connectDB().then(() => {
    console.log('MongoDB connected');
});
createSession(app);

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

// your existing routes
app.use('/', require('./server/routes/main-route'));

// make sure this is after your createSession(app) call
app.post('/chat', async (req, res) => {
    const {message} = req.body;
    if (!message) {
        return res.status(400).json({error: 'Please provide a message in the request body.'});
    }

    // Initialize history with a system prompt if this is the first turn
    if (!req.session.messages) {
        req.session.messages = [
            {role: 'system', content: 'You are a helpful assistant.'}
        ];
    }

    // Append the new user message
    req.session.messages.push({role: 'user', content: message});

    try {
        // Send the entire history to OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: req.session.messages
        });

        const reply = completion.choices?.[0]?.message?.content;
        if (!reply) throw new Error('No reply from OpenAI');

        // Save assistant’s response in session history
        req.session.messages.push({role: 'assistant', content: reply});

        res.json({reply});
    } catch (err) {
        console.error('OpenAI error:', err);
        res.status(500).json({error: 'Failed to get response from OpenAI.'});
    }
});

const userCollection = require("./server/models/user-model");
const boardCollection = require("./server/models/board-model").boardCollection;
const columnCollection = require("./server/models/board-model").boardColumnCollection;
const taskCollection = require("./server/models/board-model").taskCollection;

app.post('/get-board-data', async (req, res) => {
    const taskId = req.body.id;

    result = '';
    try {
        const task = await taskCollection.findById(taskId);
        if (!task) {
            console.error('Error finding board by task ID: Task not found');
        }

        const columnId = task.column;
        if (!columnId) {
            console.error('Error finding board by task ID: Task does not belong to a column');
        }

        // 2. Find the board that contains this column
        const board = await boardCollection.findOne({ "columns._id": columnId });
        if (!board) {
            console.error('Error finding board by task ID: Board not found for the given task');
        }

        let result = `TARGET TASK TITLE: ${task.title} THAT IN BOARD:\n`;

        result += `BOARD TITLE: ${board.title}\nWITH COLUMNS:\n`;

        for (const columnEntry of board.columns) {
            const column = await columnCollection.findById(columnEntry._id); // Fetch full column
            if (!column) continue;

            result += `- ${column.title}: CONTAINS TASKS:\n`;

            const tasks = await taskCollection.find({ column: column._id });
            for (const task of tasks) {
                result += `    - TITLE: ${task.title}; DESCRIPTION: ${task.description || 'No description'}\n`;
            }
        }

        res.send(result);
    } catch (error) {
        console.error('Error finding board by task ID:', error.message);
        throw error;
    }
});

app.get('/xddd', async (req, res) => {
    const response = await fetch('http://localhost:3000/get-board-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: req.query.id})
    });

    const data = await response.text();
    res.send('Response from POST: ' + data);
});

app.listen(PORT, () => {
    console.log(`Running on port http://localhost:${PORT}/`);
});

module.exports = app;  // cho phép import vào test

// Chỉ listen khi không phải môi trường test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Running on port http://localhost:${PORT}/`));
}