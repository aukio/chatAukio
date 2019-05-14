const mongoose = require("mongoose");

const MarkerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    lat: {
        type: String,
        required: true
    },
    lon: {
        type: String,
        required: true
    },

    photo: {
        type: String,
        required: true
    },
});

const Marker = mongoose.model("Marker", MarkerSchema);

module.exports = Marker;