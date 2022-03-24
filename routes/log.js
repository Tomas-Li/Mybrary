const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const Token = require('../models/token');
const { isAuthenticated, notAuthenticated } = require('../passport/authenticated');
const { sendEmail, sendVerificationEmail } = require('../utils/functions');


router.get('/login', notAuthenticated, (req, res) => {
    res.render('logs/login.ejs', {
        user: req.user,
        email: req.body.email,
        errorMessage: req.flash('errorMessage')
    });
});

router.get('/register', isAuthenticated, (req, res) => {
    res.render('logs/register.ejs', {
        user: req.user,
        email: req.body.email,
    })
});


router.post('/login', notAuthenticated, passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/login',
    passReqToCallback: true,
    failureFlash: true
}));

router.post('/register', isAuthenticated, passport.authenticate('local-signup', {
    successRedirect: '/login',
    failureRedirect: '/register',
    passReqToCallback: true,
    failureFlash: true
}));

router.get('/verify/:token', notAuthenticated, async (req, res) => {
    if(!req.params.token){
        req.flash('errorMessage', 'Invalid Token');
        return res.redirect('/');
    }
    try {
        const token = await Token.findOne({ token: req.params.token });
        if(!token){
            req.flash('errorMessage', 'Token doesn\'t exist or has expired');
            return res.redirect('/');
        }
        
        const user = await User.findOne({ _id: token.userId });
        if(!user){
            req.flash('errorMessage', 'Unable to find a user for this token');
            return res.redirect('/');
        }
        if(user.isVerified){
            req.flash('errorMessage', 'This user has already been verified');
            return res.redirect('/');
        }

        user.isVerified = true;
        await user.save();
        res.render('logs/verified',{
            user: user
        });
    } catch (error) {
        req.flash('errorMessage', "Something went wrong")
        res.redirect('/');
    }
})

router.get('/resend', notAuthenticated, (req, res) => {
    res.render('logs/resend', {
        user: req.user,
        errorMessage: req.flash('errorMessage')
    });
})

router.post('/resend', notAuthenticated, async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user){
            req.flash('errorMessage', `The email address ${req.body.email} is not associated with any account. Double-check your email address and try again.`)
            return res.redirect('/resend');
        }
        if (user.isVerified){
            req.flash('errorMessage', 'This account has already been verified. Please log in.')
            return res.redirect('/login');
        }

        await sendVerificationEmail(user, req, res);
        req.flash('errorMessage', 'Verification Email sent');
        res.redirect('/login');
    } catch (error) {
        req.flash('errorMessage', error.message);
        res.redirect('/resend');
    }
})

router.get('/recover', notAuthenticated, (req, res) => {
    res.render('logs/recover', { 
        user: req.user,
        errorMessage: req.flash('errorMessage')
    })
})

router.post('/recover', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email});
        
        if(!user){
            req.flash('errorMessage', 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.');
            res.redirect('/recover');
        }

        user.generatePasswordReset();
        await user.save();

        let subject = "Password change request";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let link = "http://" + req.headers.host + "/reset/" + user.resetPasswordToken;
        let html = `<p>Hi ${user.firstName}</p>
                    <p>Please click on the following <a href="${link}">link</a> to reset your password.</p> 
                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

        await sendEmail({to, from, subject, html});

        req.flash('errorMessage', `A reset password email has been sent to ${user.email}`);
        res.redirect('/');
    } catch (error) {
        req.flash('errorMessage', error.message);
        res.redirect('/');
    }
})

router.get('/reset/:token', notAuthenticated, async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: {$gt: Date.now()} });

        if (!user){
            req.flash('errorMessage', 'Password reset token is invalid or has expired.')
            return res.redirect('/')
        }

        //Redirect user to <form> with the email address
        res.render('logs/reset', { 
            user: user,
            errorMessage: req.flash('errorMessage')
        });
    } catch (error) {
        req.flash('errorMessage', error.message)
        res.redirect('/');
    }
})

router.post('/reset/:token', notAuthenticated ,async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({resetPasswordToken: token, resetPasswordExpires: {$gt: Date.now()}});

        if (!user){
            req.flash('errorMessage', 'Password reset token is invalid or has expired.');
            return req.redirect('/')
        };

        if(req.body.password !== req.body.confirmPassword) {
            req.flash('errorMessage', 'Passwords didn\'t match')
            return res.redirect(`${token}`)
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.isVerified = true;
        await user.save();

        let subject = "Your password has been changed";
        let to = user.email;
        let from = process.env.FROM_EMAIL;
        let html = `<p>Hi ${user.firstName}</p>
                    <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`

        await sendEmail({to, from, subject, html});

        req.flash('errorMessage', 'Password reset successful')
        res.redirect('/login');

    } catch (error) {
        res.status(500).send( error.message );
    }
})

router.get('/logout', isAuthenticated, (req, res) => {
    req.logout();
    res.redirect('/');
})


module.exports = router;