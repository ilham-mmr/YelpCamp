const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const { notLoggedIn } = require('../middleware/middleware');
const users = require('../controllers/users');

router.route('/register')
    .get(notLoggedIn, users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(notLoggedIn, users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.successLogin);

router.get('/logout', users.logout);

module.exports = router;