const express = require('express');
const router = express.Router();
const Camp = require('../models/camp.js');
const catchAsync = require('../utilities/catchAsync.js');
const { validateCamp, isAuthor, isLoggedIn } = require('../middleware.js');
const camps = require('../controllers/camps.js');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })


router.route('/')
    .get(catchAsync(camps.index))
    // .post(isLoggedIn, validateCamp, catchAsync(camps.create))
    .post(upload.single('image'), (req, res, next) => {
        res.send(req.body, req.file);
    })

router.get("/new", isLoggedIn, camps.createForm);

router.route('/:id')
    .put(isLoggedIn, isAuthor, validateCamp, catchAsync(camps.edit))
    .get(catchAsync(camps.one))
    .delete(isLoggedIn, isAuthor, catchAsync(camps.destroy))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(camps.editForm));

module.exports = router;
