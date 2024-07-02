const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const { storeReturnTo } = require('../middleware');
const auths = require('../controllers/auths')

router.get('/register', auths.registerForm);

router.post('/register', catchAsync(auths.register));

router.get('/login', auths.loginForm);

router.post('/login', storeReturnTo, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), auths.login);

router.get('/logout', auths.logout);

module.exports = router;
