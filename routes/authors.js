const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');


// All authors routes
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }//it's a req.query because the form used a GET method (param inside url)!
    try {
        const authors = await Author.find(searchOptions);
        res.render("authors/index", { 
            authors: authors,
            searchOptions: req.query,
        });;
    } catch {
        res.redirect('/');
    }
})

// New authors routes (form for creation)
router.get('/new', (req, res) => {
    res.render('authors/new', { author: new Author() });
})

// Create author route
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    });
    try{
        const newAuthor = await author.save(); 
        //res.redirect(`authors/${newAuthor.id}`);
        res.redirect('authors');
        // if gucchi then redirect to the new input's page
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error Creating Author'
        }); //If err then reload the page with the inputs and a error msg
    }
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const books = await Book.find({ author: author.id }).limit(8).exec();
        const hasbooks = (books.length > 0) ? true : false; 
        res.render('authors/show', {
            author: author,
            bookByAuthor: books,
            hasBooks: hasbooks
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author: author });
    } catch {
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author;
    try{
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        await author.save(); //I'm overwriting the entry!
        res.redirect(`/authors/${author.id}`);
        // if gucchi then redirect to the updated entry's page
    } catch {
        //the try code could fail twice (retrieving the data, or saving)
        if (author == null) {
            //fail retrieving
            res.redirect('/');
        } else {
        res.render('authors/edit', {
            author: author,
            errorMessage: 'Error Updating Author'
            }); //If err then reload the page with the inputs and a error msg
        }
    }
})

//perm is a parameter to avoid multi-delete from the authors-index
router.delete('/:id-:perm', async (req, res) => {
    let author;
    try{
        //I'm doing the remove testing here so to avoid the validate method
        //Besides it makes more sense here
        author = await Author.findById(req.params.id);
        let books = await Book.find({ author: author.id});
        if (books.length > 0) {
            if (req.params.perm === 'F') {
                throw "Can't Delete an author with asociated books from authors-index";
            } else if (req.params.perm === 'T') {
                for (let book of books){
                    await book.remove();
                }
                await author.remove();
                res.redirect('/authors')
            }
        } else {
            await author.remove();
        }
        res.redirect('/authors'); // if gucchi then redirect to the authors-index
    } catch (e) {
        if (author == null) {
            res.redirect('/');
        } else {
            const searchOptions = {};
            const authors = await Author.find(searchOptions);
            res.render('authors/index.ejs', {
                authors: authors,
                searchOptions: req.query,
                errorMessage: 'The author has books associated with him. If you want to delete him do it from his own page'
            })
        }
    }
})

module.exports = router;
