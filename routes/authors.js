const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');
const {isAuthenticated, notAuthenticated} = require('../passport/authenticated');


// All authors routes
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    }//it's a req.query because the form used a GET method (param inside url)!
    try {
        const authors = await Author.find(searchOptions);
        res.render("authors/index", { 
            user: req.user,
            authors: authors,
            searchOptions: req.query,
        });;
    } catch {
        res.redirect('/');
    }
})

// New authors routes (form for creation)
router.get('/new', isAuthenticated, (req, res) => {
    res.render('authors/new', {
        user: req.user,
        author: new Author()
    });
})

// Create author route
router.post('/', isAuthenticated, async (req, res) => {
    const author = new Author({
        name: req.body.name,
        nbooks : req.body.nbooks,
        born : req.body.born,
        died : req.body.died,
        information : req.body.information
    });
    try{
        const newAuthor = await author.save(); 
        //res.redirect(`authors/${newAuthor.id}`);
        res.redirect('authors');
        // if gucchi then redirect to the new input's page
    } catch {
        res.render('authors/new', {
            user: req.user,
            author: author,
            errorMessage: 'Error Creating Author'
        }); //If err then reload the page with the inputs and a error msg
    }
})

router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const showBooks = await Book.find({ author: author.id }).limit(8).exec();
        const books = await (Book.find({ author: author.id }).exec());
        const numBooks = books.length;
        let namebooks = [];
        for (let book of books){
            namebooks.push(book.title);
        }
        const hasbooks = (numBooks) ? true : false; 
        res.render('authors/show', {
            user: req.user,
            author: author,
            hasBooks: hasbooks,
            bookByAuthor: showBooks,
            numBooks: numBooks,
            namebooks: namebooks
        })
    } catch {
        res.redirect('/')
    }
})

router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try{
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', {
            user: req.user,
            author: author
        });
    } catch {
        res.redirect('/authors')
    }
})

router.put('/:id', isAuthenticated, async (req, res) => {
    let author;
    try{
        author = await Author.findById(req.params.id);
        author.name = req.body.name;
        author.nbooks = req.body.nbooks;
        author.born = req.body.born;
        author.died = req.body.died;
        author.information = req.body.information;
        await author.save(); //I'm overwriting the entry with this!
        res.redirect(`/authors/${author.id}`);
        // if gucchi then redirect to the updated entry's page
    } catch {
        //the try code could fail twice (retrieving the data, or saving)
        if (author == null) {
            //fail retrieving
            res.redirect('/');
        } else {
        res.render('authors/edit', {
            user: req.user,
            author: author,
            errorMessage: 'Error Updating Author'
            }); //If err then reload the page with the inputs and a error msg
        }
    }
})

//perm is a parameter to avoid multi-delete from the authors-index
router.delete('/:id-:perm', isAuthenticated, async (req, res) => {
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
                return res.redirect('/authors')
            }
        } else {
            await author.remove();
        }
        res.redirect('/authors'); // if gucchi then redirect to the authors-index
    } catch (e) {
        if (author == null) {
            return res.redirect('/');
        } else {
            const searchOptions = {};
            const authors = await Author.find(searchOptions);
            res.render('authors/index.ejs', {
                user: req.user,
                authors: authors,
                searchOptions: req.query,
                errorMessage: 'The author has books associated with him. If you want to delete him do it from his own page'
            })
        }
    }
})

module.exports = router;
