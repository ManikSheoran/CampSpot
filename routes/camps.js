const express = require('express');
const router = express.Router();

const Camp = require('../models/camp.js');
const catchAsync = require('../utilities/catchAsync.js');
const { validateCamp, isAuthor, isLoggedIn } = require('../middleware.js');

// Route to get all camps
router.get("/", catchAsync(async (req, res) => {
    const camps = await Camp.find({});
    res.render("camps/index", { camps, title: 'All Camps' });
}));

// Route to render form to create a new camp
router.get("/new", isLoggedIn, (req, res) => {
    res.render("camps/new", { title: 'New Camp' });
});

// Route to create a new camp
router.post("/", isLoggedIn, validateCamp, catchAsync(async (req, res, next) => {
    const newCamp = new Camp(req.body.camp);
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Successfully created a new camp!');
    res.redirect(`/camps/${newCamp._id}`);
}));

// Route to render form to edit a camp
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    res.render("camps/edit", { camp, title: `Edit ${camp.title}` });
}));

// Route to update a camp
router.put("/:id", isLoggedIn, isAuthor, validateCamp, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    await Camp.findByIdAndUpdate(id, { ...req.body.camp }, { new: true });
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    req.flash('success', 'Successfully updated the camp!');
    res.redirect(`/camps/${id}`);
}));

// Route to delete a camp
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    await Camp.findByIdAndDelete(id);
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    req.flash('success', 'Successfully deleted the camp!');
    res.redirect('/camps');
}));

// Route to show a specific camp
router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    res.render("camps/show", { camp, title: camp.title });
}));

module.exports = router;
