const res = require('express/lib/response');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.js');
const { sendVerificationEmail } = require('../utils/functions')

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    //DB->email is already set to unique, but we double check just to be sure there won't be double users
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (user) {
        return done(null, false, { message: 'Email Already Used' });
    }

    if(password !== req.body.confirmPassword){
        return done(null, false, { message: 'Passwords provided aren\'t equals' });
    }

    const newUser = new User();
    newUser.email = email;
    newUser.password = password;
    newUser.firstName = req.body.firstName;
    newUser.lastName = req.body.lastName;
    newUser.bio = req.body.bio;
    newUser.status = req.body.status;
    try {
        const user_ = await newUser.save();
        sendVerificationEmail(user_, req, res);
        done(null, false, { message: 'An email has been sent for account verification' })
    } catch (error) {
        done(error, false);
    }
}));

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    email = email.toLowerCase();
    const user = await User.findOne({ email: email });
    if(!user) {
        return done(null, false, { message: 'User Not Found'});
    }
    if(! await user.comparePassword(password)) {
        return done(null, false, { message: 'Incorrect Password'});
    }
    if(!user.isVerified) {
        return done(null, false, {message: 'User hasn\'t been verified'});
    }

    done(null, user);
}));