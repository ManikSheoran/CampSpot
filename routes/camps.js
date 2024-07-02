const express = require('express');
const router = express.Router();
const Camp = require('../models/camp.js');
const catchAsync = require('../utilities/catchAsync.js');
const { validateCamp, isAuthor, isLoggedIn } = require('../middleware.js');
const camps = require('../controllers/camps.js');

// Route to get all camps
router.get("/", catchAsync(camps.index));

// Route to render form to create a new camp
router.get("/new", isLoggedIn, camps.createForm);

// Route to create a new camp
router.post("/", isLoggedIn, validateCamp, catchAsync(camps.create));

// Route to render form to edit a camp
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(camps.editForm));

// Route to update a camp
router.put("/:id", isLoggedIn, isAuthor, validateCamp, catchAsync(camps.edit));

// Route to delete a camp
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(camps.destroy));

// Route to show a specific camp
router.get("/:id", catchAsync(camps.one));

module.exports = router;
