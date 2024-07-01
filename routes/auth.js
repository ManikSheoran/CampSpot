const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const flash = require('connect-flash');
const { storeReturnTo } = require('../middleware');


router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register' });
});

router.post('/register', catchAsync(async (req, res) => {
    const { email, username, password } = req.body;
    try {
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp!');
            return res.redirect('/camps');
        });
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('/register');
    }
}));

router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

router.post('/login', storeReturnTo, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/camps';
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash('success', 'Goodbye!');
        res.redirect('/camps');
    });
});

module.exports = router;
