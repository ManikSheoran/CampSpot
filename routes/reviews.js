const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utilities/catchAsync.js');
const Review = require("../models/review.js");
const ExpressError = require('../utilities/ExpressError');
const Camp = require('../models/camp.js');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware.js');

// Route to create a new review
router.post("/", isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp) {
        throw new ExpressError('Camp not found', 404);
    }
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review);
    await camp.save();
    await review.save();
    req.flash('success', 'Successfully created a new review!');
    res.redirect(`/camps/${id}`);
}));

// Route to delete a review
router.delete("/:rid", isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, rid } = req.params;
    const camp = await Camp.findById(id);
    if (!camp) {
        throw new ExpressError('Camp not found', 404);
    }
    await Camp.findByIdAndUpdate(id, { $pull: { reviews: rid } });
    await Review.findByIdAndDelete(rid);
    req.flash('success', 'Successfully deleted the review!');
    res.redirect(`/camps/${id}`);
}));

module.exports = router;
