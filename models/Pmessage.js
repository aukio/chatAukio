const mongoose = require("mongoose");

const PrivMessageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    SendedTo:{
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
});

const PrivMessage = mongoose.model("Private messages", PrivMessageSchema);

module.exports = PrivMessage;