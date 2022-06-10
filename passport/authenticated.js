//Middlewares de autenticacion

function isAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

function notAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect('/');
    }
    next();
}

module.exports = { 
    isAuthenticated: isAuthenticated,
    notAuthenticated: notAuthenticated
};