// Checking the env situation
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const {
    SESS_NAME="sid",
    PORT=3000,
    SESS_LIFETIME=1000*60*60//1h
} = process.env
const IN_PROD = process.env.NODE_ENV === 'production';


// Imports
const express = require('express');
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const flash = require('express-flash');
const morgan = require('morgan');
const passport = require('passport');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


// Import passport config
require('./passport/local-auth');


// Mongoose connection
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connection to MongoDB Succesful'));


// Initialization, configuration and Middlewares
const app = express();

app.set("view engine", "ejs");
app.set('views', __dirname + '/views');//This tell express that our .ejs will be there!
app.set('layout', 'layouts/layout'); //folder layout, file layout

//app.use(morgan('dev'));
app.use(expressLayouts);
app.use(express.static('public')); //We are telling the folder where our static files will be!
app.use(express.urlencoded( { extended: false , limit: '10mb'} )); //This allowes me to access the data from <form>
app.use(methodOverride('_method')); //Parameter that the forms will use!
app.use(session({
    name: SESS_NAME,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: 'none',
        secure: IN_PROD
    }
}));
app.use(flash());
app.use(passport.initialize());


// Routing
app.use('/', require('./routes/index'));
app.use('/', require('./routes/log'));
app.use('/authors', require('./routes/authors'));
app.use('/books', require('./routes/books'));


app.listen(PORT, () =>{
    console.log(`Listening on: http://localhost:${PORT}`)
}); //For dev is 3000, when it's a real depolyment is an env variable