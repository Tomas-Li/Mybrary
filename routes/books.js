const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

//This is for recovering the name of the image from an upload!

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']; //images types

// We aren't using multor since we will upload our files to the db
// const path = require('path');
// const uploadPath = path.join('public', Book.coverImageBasePath); 
// const multer = require('multer');
// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype));
//     }
// })

//This is for avoiding upload of images from entries that didn't make it to the db:
//const fs = require('fs'); //File System library!

// All Books Routes
router.get('/', async (req, res) => {
    let query = Book.find(); //We call all entries
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
        //title is the name of the column in the table that we want to check
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
        console.log(req.query.publishedBefore)
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
    //No longer used
    //const filename = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        //coverImageName: filename //removed as the image itself will be saved
    })
    saveCover(book, req.body.cover); //function to save the image and its type

    try{
        const newBook = await book.save();
        //res.redirect(`books/${newBook.id}`); //Not ready yet
        res.redirect('books');
    } catch {
        //This is no longer needed as we are keeping the cover in our db
        //If there is an error we want to delete the upload of the image
        // if(book.coverImageName != null) {
        //     removeBookCover(book.coverImageName);
        // }
        //If there is an error we want to reload the "newBook" page with the values 
        renderNewPage(res, book, true);
    }
})

//Function for creating a new entry (from 0 or with values after a fail!)
    //Arguments:
        //res -> we need to render
        //book -> we may render a new book or an existing book
        //hasError -> if there is an error we need to know
async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({});
        const params = { 
            book: book, 
            authors: authors };
        if (hasError) params.errorMessage = 'Error Creating Book';
        res.render('books/new', params);
    } catch {
        res.redirect('/books');
    }
}

//Not needed as we are keeping the cover itself in our server
// function removeBookCover(fileName) {
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if (err) console.error(err);
//     });
// }

function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return;
    const cover = JSON.parse(coverEncoded);
    if (cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    } //cover.type comes from how coverEncoded was a JSON file with a column for type!
      //This can be checked from the plugin's page where there are examples
}

module.exports = router;