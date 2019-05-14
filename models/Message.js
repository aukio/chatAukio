const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },

    date: {
        type: String,
        required: true
    },
});

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;