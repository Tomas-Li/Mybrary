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

//This is important to avoid deleting data that is correlative to another db
    //But this method is so clumsy, I don't know how to make it work with findAndDelete
// authorSchema.pre('remove', function(next) {
//     Book.find({ author: this.id}, (err, books) => {
//         if (err) {
//             next(err); //this will only trigger is there is a db connection problem
//         } else if (books.length > 0) { //this means there are book associated with our author
//             next(new Error('This author has books still!'));
//         } else {
//             next(); //This will delete the author
//         }
//     })
// })

module.exports = mongoose.model('Author', authorSchema);