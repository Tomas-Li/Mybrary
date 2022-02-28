if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const expressLayouts = require('express-ejs-layouts')

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connection to MongoDB Succesful'));

const indexRouter = require('./routes/index');

const app = express();

app.set("view engine", "ejs");
app.set('views', __dirname + '/views');//This tell express that our .ejs will be there!
app.set('layout', 'layouts/layout'); //folder layout, file layout
app.use(expressLayouts);
app.use(express.static('public')); //We are telling the folder where our static files will be!

app.use('/', indexRouter);

app.listen(process.env.PORT || 3000); //For dev is 3000, when it's a real depolyment is an env variable