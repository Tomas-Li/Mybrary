const express = require('express')
const router = express.Router();
const User = require('../models/user');
const { isAuthenticated, notAuthenticated } = require('../passport/authenticated');
const { sendVerificationEmail } = require('../utils/functions')

router.get('/control-panel', isAuthenticated, async (req, res) => {
    try {
        const status = req.user.status;    
        if(status === 'Employee' || status === 'Visitor'){
            req.flash('errorMessage', 'You don\'t have the permissions to access that page')
            res.redirect('/');
        }
    
        if(status === 'Owner'){
            const users_list = await User.find({ status: { $ne: "Owner" } });
            res.render('user/control-panel', {
                user: req.user,
                users_list: users_list,
                errorMessage: req.flash('errorMessage')
            })
        }
    
        if(status === 'Manager'){
            const users_list = await User.find({ status: { $nin: ["Owner", "Manager"] } });
            res.render('user/control-panel', {
                user: req.user,
                users_list: users_list,
                errorMessage: req.flash('errorMessage')
            })
        }
    
    } catch (error) {
        req.flash('errorMessage', 'Couldn\'t access control panel, something went wrong')
        res.redirect(`/user/${req.user._id}`)
    }    
})

router.delete('/control-panel/:id', isAuthenticated, (req, res) => {
    const status = req.user.status;
    if(status === 'Employee' || status === 'Visitor'){
        req.flash('errorMessage', 'You don\'t have the permissions to access that page')
        res.redirect('/');
    }

    
})

router.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const update = req.body;
        const user = await User.findById(req.user._id);

        if(req.params.id.toString() !== user._id.toString()){
            req.flash('errorMessage', 'You don\'t have the perms to edit this profile')
            return res.redirect('/');
        }
        
        res.render('user/update',{
            user: req.user,
            email: req.user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            errorMessage: req.flash('errorMessage')
        })
    } catch (error) {
        req.flash('errorMessage', 'Something went wrong');
        res.redirect('/');
    }
});

router.put('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const update = req.body;
        const user = await User.findById(req.user._id);
        let emailChanged_bool = false

        if(req.params.id.toString() !== user._id.toString()){
            req.flash('errorMessage', 'You don\'t have the perms to edit this profile')
            return res.redirect('/');
        }
        if (await user.comparePassword(update.actualPassword)){
            if(!(update.email === '' || update.email === null)){ 
                const email_may_exist = await User.findOne({ email: update.email })
                if (user.email !== update.email){
                    if (email_may_exist){
                        req.flash('errorMessage', 'The new email provided is already in use');
                        return res.redirect(`/user/${user._id}`);
                    }
                    user.email = update.email;
                    user.isVerified = false
                    emailChanged_bool = true
                }
            }
            if(!(update.password === '' || update.password === null) && update.password === update.confirmPassword){
                user.password = update.password
            }
            if(!(update.firstName === '' || update.firstName === null)){
                user.firstName = update.firstName;
            }
            if(!(update.lastName === '' || update.lastName === null)){
                user.lastName = update.lastName;
            }
            if(!(update.bio === '' || update.bio === null)){
                user.bio = update.bio;
            }

            await user.save()

            if(emailChanged_bool){
                sendVerificationEmail(user, req, res)
                req.flash('errorMessage', 'A new verification email has been sent to the new email address')
                return res.redirect('/logout');
            }
            req.flash('errorMessage', 'The update was successful');
            return res.redirect(`/user/${user._id}`);
        }
        req.flash('errorMessage', 'The account password provided was incorrect')
        res.redirect(`/user/${user._id}`);
    } catch (error) {
        req.flash('errorMessage', 'Something went wrong while updating user information');
        res.redirect(`/user/${req.user._id}`);
    }
});

router.get('/:id', isAuthenticated, async (req, res) => { 
    try {
        const user = await User.findById(req.user._id);
    
        if(req.user.status === 'Visitor' && req.params.id !== user._id){
                req.flash('errorMessage', 'You don\'t have the perms to enter this profile')
                return res.redirect('/');
        };
        res.render('user/show', {
            user: req.user,
            errorMessage: req.flash('errorMessage')
        });
    } catch (error) {
        req.flash('errorMessage', 'Something went wrong');
        req.redirect('/');
    }
});

//UPDATE SHOULD CHECK THAT PARAMS.ID = USER._ID

module.exports = router