const express = require('express')
const router = express.Router();
const { isAuthenticated, notAuthenticated } = require('../passport/authenticated');

router.get('/user/:id', isAuthenticated,(req, res) => {
    if(req.params.id !== req.user._id){
        req.flash('errorMessage', 'You don\'t have the perms to enter this profile')
        return 
    }
    res.render('user/show', {
        user: user
    })
})


//UPDATE SHOULD CHECK THAT PARAMS.ID = USER._ID

module.exports = router