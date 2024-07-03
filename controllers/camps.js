const Camp = require('../models/camp.js');

module.exports.index = async (req, res) => {
    const camps = await Camp.find({});
    res.render("camps/index", { camps, title: 'All Camps' });
};

module.exports.createForm = (req, res) => {
    res.render("camps/new", { title: 'New Camp' });
};

module.exports.create = async (req, res, next) => {
    const newCamp = new Camp(req.body.camp);
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
    await Camp.findByIdAndUpdate(id, { ...req.body.camp }, { new: true });
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
    req.flash('success', 'Successfully updated the camp!');
    res.redirect(`/camps/${id}`);
};

module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    const camp = await Camp.findById(id);
    await Camp.findByIdAndDelete(id);
    if (!camp) {
        req.flash('error', 'Camp not found');
        return res.redirect('/camps');
    }
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


