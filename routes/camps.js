const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync.js');
const { validateCamp, isAuthor, isLoggedIn } = require('../middleware.js');
const camps = require('../controllers/camps.js');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(camps.index))
    .post(isLoggedIn, upload.single('image'), validateCamp, catchAsync(camps.create))

router.get("/new", isLoggedIn, camps.createForm);

router.route('/:id')
    .put(isLoggedIn, isAuthor, upload.single('image'), validateCamp, catchAsync(camps.edit))
    .get(catchAsync(camps.one))
    .delete(isLoggedIn, isAuthor, catchAsync(camps.destroy));

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(camps.editForm));

module.exports = router;
