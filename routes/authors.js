const express = require('express');
const router = express.Router();
const Author = require('../models/author');

// All authors routes
router.get('/', async (req, res) => {
    let searchOptions = {};
    if (req.query.name != null && req.query.name != '') {
        console.log(req.query.name);
        searchOptions.name = new RegExp(req.query.name, 'i');
    }//it's a req.query because the form used a GET method (param inside url)!
    try {
        const authors = await Author.find(searchOptions);
        res.render("authors/index", { 
            authors: authors,
            searchOptions: req.query
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
        // res.redirect(`authors/${newAuthor.id}`);
        res.redirect(`authors`)
        // if gucchi then redirect to the new input's page
    } catch {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error Creating Author'
        }); //If err then reload the page with the inputs and a error msg
    }
})

module.exports = router;