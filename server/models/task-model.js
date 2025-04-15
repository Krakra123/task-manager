const mongoose = require('mongoose');

const schema = mongoose.Schema;
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

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Task', taskSchema);