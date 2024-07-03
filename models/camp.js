const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require("./review");
const User = require("./user");
const { campSchema } = require('../schemas');

const CampSchema = new Schema({
    title: String,
    image: {
        url: String,
        filename: String
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Camp', CampSchema);
