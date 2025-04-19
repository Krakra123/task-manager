const mongoose = require('mongoose');

const schema = mongoose.Schema;
const userSchema = new schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Users', userSchema);