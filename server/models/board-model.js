const mongoose = require('mongoose');

const schema = mongoose.Schema;
const boardSchema = new schema({
    title: {
        type: String,
        trim: true,
        required: true
    },

    columns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Column',
        },
    ],

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})
const columnSchema = new schema({
    title: {
        type: String,
        trim: true,
        required: true
    },

    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },
    ],

    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})
const taskSchema = new schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String
    },
    dueDate: {
        type: Date
    },

    column: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Column',
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = {
    boardCollection: mongoose.model('Board', boardSchema),
    boardColumnCollection: mongoose.model('Column', columnSchema),
    taskCollection: mongoose.model('Task', taskSchema)
};