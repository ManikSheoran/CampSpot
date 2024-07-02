const express = require('express');
const router = express.Router();
const Camp = require('../models/camp.js');
const catchAsync = require('../utilities/catchAsync.js');
const { validateCamp, isAuthor, isLoggedIn } = require('../middleware.js');
const camps = require('../controllers/camps.js');

router.route('/')
    .get(catchAsync(camps.index))
    .post(isLoggedIn, validateCamp, catchAsync(camps.create))

   
router.get("/new", isLoggedIn, camps.createForm);

router.route('/:id')
    .put(isLoggedIn, isAuthor, validateCamp, catchAsync(camps.edit))
    .get(catchAsync(camps.one))
    .delete(isLoggedIn, isAuthor, catchAsync(camps.destroy))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(camps.editForm));

module.exports = router;
