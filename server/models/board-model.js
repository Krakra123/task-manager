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
            ref: 'BoardColumn',
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
const boardColumnSchema = new schema({
    title: {
        type: String,
        trim: true,
        required: true
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

module.exports = {
    boardCollection: mongoose.model('Board', boardSchema),
    boardColumnCollection: mongoose.model('BoardColumn', boardColumnSchema)
};