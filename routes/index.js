const express = require('express');
const router = express.Router();
const Book = require('../models/book')
const { cleanError } = require('../utils/functions');

router.get('/', async (req, res) => {
    let books;
    try {
        books = await Book.find().sort({ createdAt: 'desc' }).limit(12).exec();
    } catch {
        books = []
    }

    res.render("index", {
        user: req.user,
        books: books,
        errorMessage: req.flash('errorMessage')
    });

})

module.exports = router;