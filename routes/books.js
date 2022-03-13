const express = require('express');
const { redirect } = require('express/lib/response');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']; //images types

// All Books Routes
router.get('/', async (req, res) => {
    let query = Book.find(); //We call all entries
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
        //title is the name of the column in the table that we want to check
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
        //if publishDate < publishedBefore => add to the query
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
        //if publishDate > publishedAfter => add to the query
    }
    try{
        const books = await query.exec();
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        });
    } catch {
        res.redirect('/');
    }
})

// New Books Routes (form for creation)
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book()); //There is no third argument as here it can't have an error!
})

// Create Book Route
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        price: req.body.price,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
    })
    saveCover(book, req.body.cover); //function to save the image and its type

    try{
        const newBook = await book.save();
        res.redirect(`books/${newBook.id}`);
    } catch {
        renderNewPage(res, book, true);
    }
})

// Show Book Route
router.get('/:id', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', { book: book});
    } catch {
        res.redirect('/');
    }
})

//Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book)
    } catch {
        res.redirect('/');
    }
})

// Update Book Route
router.put('/:id', async (req, res) => {
    let book
    try{
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.price = req.body.price;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if (req.body.cover != null && req.body.cover != '') {
            saveCover(book, req.body.cover);
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch {
        if (book != null) { //we got the book but run into a problem reading the page
            renderEditPage(res, book, true);
        } else {
            redirect('/');
        }
    }
})

// Delete Book Route
router.delete('/:id', async (req, res) => {
    let book
    try{
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    } catch {
        if (book != null) { //we got the book but run into when deleting
            res.render('books/show', {
                book: book,
                errorMessage: 'Couldnt remove book'
            })
        } else {
            redirect('/');
        }
    }
})


async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError);
}


async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError);
}

//This allows us to use the function for creating entries for editing entries!
async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({});
        const params = { 
            book: book, 
            authors: authors };
        if (hasError) {
            if (form === 'edit'){
                params.errorMessage = 'Error Editing Book'
            } else {
                params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`books/${form}`, params);
    } catch {
        res.redirect('/books');
    }
}


function saveCover(book, coverEncoded) {
    if (coverEncoded == null || coverEncoded == '') return;
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    } //cover.type comes from how coverEncoded was a JSON file with a column for type!
      //This can be checked from the plugin's page where there are examples
}

module.exports = router;