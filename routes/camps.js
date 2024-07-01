const express = require('express');
const router = express.Router();

const Camp = require('../models/camp.js');
const catchAsync = require('../utilities/catchAsync.js');
const ExpressError = require('../utilities/ExpressError.js');
const { campSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware.js');

// Middleware to validate camp data
const validateCamp = (req, res, next) => {
    const { error } = campSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

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
router.get("/:id/edit", isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/camps/${id}`)
    }
    res.render("camps/edit", { camp, title: `Edit ${camp.title}` });
}));

// Route to update a camp
router.put("/:id", isLoggedIn, validateCamp, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/camps/${id}`)
    }
    await Camp.findByIdAndUpdate(id, { ...req.body.camp }, { new: true });
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    req.flash('success', 'Successfully updated the camp!');
    res.redirect(`/camps/${id}`);
}));

// Route to delete a camp
router.delete("/:id", isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/camps/${id}`)
    }
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
    const camp = await Camp.findById(id).populate('reviews');
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    res.render("camps/show", { camp, title: camp.title });
}));

module.exports = router;
