const Camp = require('../models/camp.js');
const cloudinary = require('cloudinary').v2;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxTOKEN = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxTOKEN });

module.exports.index = async (req, res) => {
    const camps = await Camp.find({});
    res.render("camps/index", { camps, title: 'All Camps' });
};

module.exports.createForm = (req, res) => {
    res.render("camps/new", { title: 'New Camp' });
};

module.exports.create = async (req, res, next) => {
    const geocodes = await geocoder.forwardGeocode({
        query: req.body.camp.location,
        limit: 1
    }).send();
    const newCamp = new Camp(req.body.camp);
    newCamp.geometry = geocodes.body.features[0].geometry;
    newCamp.image = {
        url: req.file.path,
        filename: req.file.filename
    };
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success', 'Successfully created a new camp!');
    res.redirect(`/camps/${newCamp._id}`);
};

module.exports.editForm = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    res.render("camps/edit", { camp, title: `Edit ${camp.title}` });
};

module.exports.edit = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);

    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }

    const updatedCampData = { ...req.body.camp };

    // If location is updated, get the new geocodes
    if (req.body.camp.location !== camp.location) {
        const geocodes = await geocoder.forwardGeocode({
            query: req.body.camp.location,
            limit: 1
        }).send();
        updatedCampData.geometry = geocodes.body.features[0].geometry;
    }

    // Update the camp details
    const updatedCamp = await Camp.findByIdAndUpdate(id, updatedCampData, { new: true });

    // If a new image is uploaded, replace the existing one
    if (req.file) {
        // Delete the existing image from Cloudinary if it exists
        if (camp.image && camp.image.filename) {
            await cloudinary.uploader.destroy(camp.image.filename);
        }

        // Update the camp with the new image
        updatedCamp.image = {
            url: req.file.path,
            filename: req.file.filename
        };

        await updatedCamp.save();
    }

    req.flash('success', 'Successfully updated the camp!');
    res.redirect(`/camps/${id}`);
};

module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);

    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }

    if (camp.image && camp.image.filename) {
        await cloudinary.uploader.destroy(camp.image.filename);
    }

    await Camp.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the camp!');
    res.redirect('/camps');
};

module.exports.one = async (req, res) => {
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
};
