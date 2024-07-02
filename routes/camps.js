const express = require('express');
const router = express.Router();

const Camp = require('../models/camp.js');
const catchAsync = require('../utilities/catchAsync.js');
const { validateCamp, isAuthor, isLoggedIn } = require('../middleware.js');

const camps = require('../controllers/camps.js')

// Route to get all camps
router.get("/", catchAsync(camps.index));

// Route to render form to create a new camp
router.get("/new", isLoggedIn, camps.createCampForm);

// Route to create a new camp
router.post("/", isLoggedIn, validateCamp, catchAsync(camps.createCamp));

// Route to render form to edit a camp
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(camps.editCampForm));

// Route to update a camp
router.put("/:id", isLoggedIn, isAuthor, validateCamp, catchAsync(camps.editCamp));

// Route to delete a camp
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(camps.delete));

// Route to show a specific camp
router.get("/:id", catchAsync(camps.oneCamp));

module.exports = router;
