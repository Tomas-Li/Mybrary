// Checking the env situation
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Imports
const express = require('express');
const expressLayouts = require('express-ejs-layouts')

// Mongoose connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connection to MongoDB Succesful'));

// Routing
const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const booksRouter = require('./routes/books');

// Initializing express
const app = express();

// Express Configuration and Uses
app.set("view engine", "ejs");
app.set('views', __dirname + '/views');//This tell express that our .ejs will be there!
app.set('layout', 'layouts/layout'); //folder layout, file layout
app.use(expressLayouts);
app.use(express.static('public')); //We are telling the folder where our static files will be!
app.use(express.urlencoded( { extended: false , limit: '10mb'} ));

app.use('/', indexRouter);
app.use('/authors', authorRouter);
app.use('/books', booksRouter);

app.listen(process.env.PORT || 3000, () =>{
    console.log("Listening on port 3000")
}); //For dev is 3000, when it's a real depolyment is an env variable