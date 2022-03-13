const mongoose = require('mongoose');
const book = require('./book');
const Book = require('./book');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    nbooks: {
        type: Number
    },
    born: {
        type: Number
    },
    died: {
        type: Number
    },
    information: {
        type: String
    }
});

module.exports = mongoose.model('Author', authorSchema);